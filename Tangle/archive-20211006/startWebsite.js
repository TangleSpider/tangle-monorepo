require("dotenv").config();
let mysql = require("mysql");
let express = require("express");
let bodyParser = require("body-parser");
let path = require("path");
let { ethers } = require("ethers");
let app = express();

/*let config = {
    user: process.env.SQL_USER,
    database: process.env.SQL_DATABASE,
    password: process.env.SQL_PASSWORD,
}

if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
    config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}

let connection = mysql.createConnection(config);*/

let connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  database: process.env.SQL_DATABASE,
  password: process.env.SQL_PASSWORD
});

connection.connect(function(err) {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as thread id: ' + connection.threadId);
});

connection.query("create table if not exists addresses (address char(42) not null, chain int not null, timestamp int not null);", (err, res, fields) => {
    if (err) console.log("00: ", err);
});

connection.query("create table if not exists lpbalances (address char(42) not null, owner char(42) not null, amount char(66) not null, timestamp int not null);", (err, res, fields) => {
    if (err) console.log("00: ", err);
});

app.use(bodyParser.json());

let addressCheckQueue = [];
let addressCheckProcessRunning = false;
let timeSince = time => { return parseInt(Date.now() / 1000) - time };

let checkAddress = addressObject => {
    let goNext = isUsable => {
        addressObject.res.json({ usable: isUsable });
        if (addressCheckQueue.length) checkAddress(addressCheckQueue[0]);
        if (!addressCheckQueue.length) addressCheckProcessRunning = false;
    };
    addressCheckQueue.shift();
    connection.query("select address, chain, timestamp from addresses where address = '" + addressObject.address + "' and chain = " + addressObject.chain, (err, res, fields) => {
        if (err) console.log("01: ", err);
        if (res.length) {
            if (timeSince(res[0].timestamp) < 900)
                goNext(false);
            if (timeSince(res[0].timestamp) >= 900) {
                connection.query("update addresses set timestamp = " + parseInt(Date.now() / 1000) + " where address = '" + addressObject.address + "' and chain = " + addressObject.chain);
                goNext(true);
            }
        }
        if (!err && !res.length) {
            connection.query("insert into addresses (address, chain, timestamp) values('" + addressObject.address + "'," + addressObject.chain + "," + parseInt(Date.now() / 1000) + ")");
            goNext(true);
        }
    });
};

let startAddressCheckProcess = () => {
    addressCheckProcessRunning = true;
    checkAddress(addressCheckQueue[0]);
};

let attemptAddressCheckProcessStart = () => {
    if (addressCheckProcessRunning) return;
    if (!addressCheckQueue.length) return;
    startAddressCheckProcess();
};

app.post("/addressCheck", (req, res) => {
    console.log(req);
    if (
        req.body &&
        req.body.address &&
        req.body.address.match(/0x[0-9a-f]{40}/i) &&
        req.body.chain
    ) {
        req.body.res = res;
        addressCheckQueue.push(req.body);
    } else {
        res.json({ error: "bad input" });
    }
});

let webQueue = [];
let webQueueProcessRunning = false;

let processWebQueue = webQueueObject => {
    let goNext = responseObject => {
        webQueueObject.res.json({ data: responseObject });
        if (webQueue.length) processWebQueue(webQueue[0]);
        if (!webQueue.length) webQueueProcessRunning = false;
    };
    webQueue.shift();
    switch (webQueueObject.method) {
        case "start":
            if (ethers.utils.keccack256("0x" + webQueueObject.params.password.split('').map(c => { return c.charCodeAt(0).toString(16); }).join('')) != "[REDACTED]58") {
                goNext({ message: "password incorrect" });
            } else {
                goNext({ message: "password correct" });
            }
            break;
        default:
            goNext({ message: "feature in progress" });
    }
};

let startWebQueueProcess = () => {
    webQueueProcessRunning = true;
    processWebQueue(webQueue[0]);
};

let attemptWebQueueProcessStart = () => {
    if (webQueueProcessRunning) return;
    if (!webQueue.length) return;
    startWebQueueProcess();
};

setInterval(attemptAddressCheckProcessStart, 1000);
setInterval(attemptWebQueueProcessStart, 1000);

app.post("/web", (req, res) => {
    console.log(req);
    if (
        req.body &&
        req.body.method.match(/^(addLiquidity(ETH)?|start)$/) &&
        req.body.params
    ) {
        if (req.body.method == "addLiquidity") {
            if (!(
                req.body.params.chain0 &&
                req.body.params.chain1 &&
                req.body.params.token0 &&
                req.body.params.token1 &&
                req.body.params.token0Desired &&
                req.body.params.token1Desired &&
                req.body.params.amount0Min &&
                req.body.params.amount1Min &&
                req.body.params.to &&
                req.body.params.deadline
            )) return;
        }
        if (req.body.method == "start") {
            if (!(
                req.body.params.password
            )) return;
        }
        req.body.res = res;
        webQueue.push(req.body);
    } else {
        res.json({ err: "bad input" });
    }
});

app.get('/*', (req, res) => {
    console.log(req);
	switch (req.url) {
		case "/": req.url = "web/html/index.html"; break;
		case "/favicon.ico": req.url = "web/images/tangleLogo_7_6_icon.png"; break;
		default: req.url = req.url.substr(1);
	}
	switch (
		req.url ==
			"web/images/tangleLogo_7_6_250.png" ||
			"TangleWhitepaper.pdf"
	) {
		case true: res.download(path.join(__dirname, req.url)); break;
		default: res.sendFile(path.join(__dirname, req.url));
	}
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}...`);
});
