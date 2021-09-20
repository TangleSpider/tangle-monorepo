require("dotenv").config();
let keccak256 = require("@ethersproject/keccak256").keccak256;
let mysql = require("mysql");
let express = require("express");
let bodyParser = require("body-parser");
let app = express();

let connection;
if (process.env.NODE_ENV) {
    let config = {
        user: process.env.SQL_USER,
        database: process.env.SQL_DATABASE,
        password: process.env.SQL_PASSWORD,
    }

    if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') {
        config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    }

    connection = mysql.createConnection(config);
} else {
    connection = mysql.createConnection({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      database: process.env.SQL_DATABASE,
      password: process.env.SQL_PASSWORD
    });
}

connection.connect(function(err) {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
    console.log('Connected as thread id: ' + connection.threadId);
});



try {
    connection.query(/*"drop table if exists pairs;"*/
        `create table if not exists pairs (
            pair char(42) not null,
            token0 char(42) not null,
            token1 char(42) not null,
            reserve0 char(66) not null,
            reserve1 char(66) not null
        );`, (err, res, fields) => {
        if (err) console.log("00: ", err);
    });
} catch (e) {
    console.log(e);
}

try {
    connection.query(/*"drop table if exists balances;"*/
        `create table if not exists balances (
            pair char(42) not null,
            owner char(42) not null,
            balance char(66) not null
        );`, (err, res, fields) => {
        if (err) console.log("01: ", err);
    });
} catch (e) {
    console.log(e);
}

try {
    connection.query(
        `create table if not exists pendingAddLiquidityRequests (
            id int not null,
            paymentAmount char(66) not null,
            gas0 char(66) not null,
            gas1 char(66) not null,
            status0 tinyint not null,
            status1 tinyint not null,
            chain0 char(66) not null,
            chain1 char(66) not null,
            amount0Desired char(66) not null,
            amount1Desired char(66) not null,
            amount0Min char(66) not null,
            amount1Min char(66) not null
        );`, (err, res, fields) => {
        if (err) console.log("02: ", err);
    });
} catch (e) {
    console.log(e);
}



app.use(bodyParser.json());

let xdexQueue = [];
let xdexProcessRunning = false;

let quote = (amount0, reserve0, reserve1) => {
    if (amount0 <= 0) throw {
        name: "xdexError",
        message: "INSUFFICIENT_AMOUNT"
    }
    if (reserve0 <= 0 || reserve1 <= 0) throw {
        name: "xdexError",
        message: "INSUFFICIENT_LIQUIDITY"
    }
    return BigInt(amount0) * BigInt(reserve1) / BigInt(reserve0);
};

let _addLiquidity = (
    chain0,
    chain1,
    token0,
    token1,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min
) => {
    return new Promise((resolve, reject) => {
        if (chain0 == chain1) throw {
            name: "xdexError",
            message: "IDENTICAL_CHAINS"
        }
        let pair = keccak256(token0 + chain0.substr(2) + token1.substr(2) + chain1.substr(2));
        connection.query("select reserve0, reserve1 from pairs where pair = " + pair, (err, res, fields) => {
            if (err) {
                reject({
                    name: err.name,
                    message: err.message
                });
            } else {
                if (!res.length) resolve([amount0Desired, amount1Desired]);
                if (res.length) {
                    let [reserve0, reserve1] = [res[0].reserve0, res[1].reserve1];
                    let amount1Optimal = quote(amount0Desired, reserve0, reserve1);
                    if (amount1Optimal <= amount1Desired) {
                        if (amount1Optimal < amount1Min) reject({
                            name: "xdexError",
                            message: "INSUFFICIENT_1_AMOUNT"
                        })
                        resolve([amount0Desired, amount1Optimal]);
                    } else {
                        let amount0Optimal = quote(amount1Desired, reserve1, reserve0);
                        if (amount0Optimal > amount1Desired) reject({
                            name: "xdexError",
                            message: "ASSERT_ERROR_A0OA1D"
                        })
                        if (amount0Optimal < amount0Min) reject({
                            name: "xdexError",
                            message: "INSUFFICIENT_0_AMOUNT"
                        })
                        resolve([amount0Optimal, amount1Desired]);
                    }
                }
            }
        });
    })
    .catch(err => {
        throw err;
    });
};

let handleAddLiquidity = async xdexRequestBody => {
    let arguments = [
        chain0,
        chain1,
        token0,
        token1,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min
    ] = [
        xdexRequestBody.chain0,
        xdexRequestBody.chain1,
        xdexRequestBody.token0,
        xdexRequestBody.token1,
        xdexRequestBody.amount0Desired,
        xdexRequestBody.amount1Desired,
        xdexRequestBody.amount0Min,
        xdexRequestBody.amount1Min
    ];
    if (arguments.includes(undefined)) throw {
        name: "xdexError",
        message: "MISSING_ARGUMENTS"
    }
    [token0, token1].forEach(arg => {
        if (!arg.match || !arg.match(/0x[0-9a-f]{40}/i)) throw {
            name: "xdexError",
            message: "INVALID_ARGUMENTS"
        }
    });
    [chain0, chain1, amount0Desired, amount1Desired, amount0Min, amount1Min].forEach(arg => {
        if (!arg.match || !arg.match(/0x[0-9a-f]{64}/i)) throw {
            name: "xdexError",
            message: "INVALID_ARGUMENTS"
        }
    });
    if (chain1 + token1.substr(2) < chain0 + token0.substr(2))
        [
            chain0,
            chain1,
            token0,
            token1,
            amount0Desired,
            amount1Desired,
            amount0Min,
            amount1Min
        ] = [
            chain1,
            chain0,
            token1,
            token0,
            amount1Desired,
            amount0Desired,
            amount1Min,
            amount0Min
        ];
    let pair = keccak256(token0 + chain0.substr(2) + token1.substr(2) + chain1.substr(2));
    initiateAddLiquidityXTP(chain0, chain1, token0, token1, amount0Desired, amount1Desired, amount0Min, amount1Min);
    /*token0.transferFrom(msg.sender, Contract0, amount0);
    token1.transferFrom(msg.sender, Contract1, amount1);
    liquidity = IUniswapV2Pair(pair).mint(to);*/
    //return { reserves: await _addLiquidity(chain0, chain1, token0, token1, amount0Desired, amount1Desired, amount0Min, amount1Min) }
};

let handleXdexRequest = async xdexRequest => {
    let goNext = () => {
        xdexQueue.shift();
        if (xdexQueue.length) handleXdexRequest(xdexQueue[0]);
        if (!xdexQueue.length) xdexProcessRunning = false;
    };
    new Promise((resolve, reject) => {
        if (xdexRequest.req.body.method == "addLiquidity") {
            resolve(handleAddLiquidity(xdexRequest.req.body));
        }
        reject({
            name: "xdexError",
            message: "INVALID_REQUEST"
        });
    })
    .then(response => {
        xdexRequest.res.json({ response: response });
        goNext();
    })
    .catch(err => {
        let errObject = {
            ERR: {
                name: err.name,
                message: err.message
            }
        };
        console.log(errObject);
        xdexRequest.res.json(errObject);
        goNext();
    });
};

let attemptXdexProcessStart = () => {
    if (xdexProcessRunning) return;
    if (!xdexQueue.length) return;
    xdexProcessRunning = true;
    handleXdexRequest(xdexQueue[0]);
};

app.post("/XDEX", async (req, res) => {
    xdexQueue.push({
        req: req,
        res: res
    });
});

setInterval(attemptXdexProcessStart, 1000);

app.get('/*', (req, res) => {
	res.sendFile("xdex.html", { root: "." });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}...`);
});
