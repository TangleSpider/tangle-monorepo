let http = require("http");
let EventEmitter = require("events");

let xdex = new EventEmitter();
xdex.server = http.createServer((req, res) => {
    let buffer = Buffer.from("");
    req.on("data", d => {
        //console.log("reqData", d);
        buffer = Buffer.concat([buffer, d]);
    });
    req.on("end", () => {
        try {
            //console.log("reqEnd");
            let body = JSON.parse(buffer.toString());
            body.res = res;
            if (
                body.method == "addLiquidity" ||
                body.method == "swap" ||
                body.method == "removeLiquidity"
            ) xdex.emit("xdexRequest", body);
            if (body.method == "ping") {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.write("Pong!");
                res.end();
            }
        } catch (e) {
            //console.log(e, buffer.toString());
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write("Hello World!");
            res.end();
        }
    });
});
xdex.server.listen(8000);

module.exports = xdex;
