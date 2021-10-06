let http = require('http')
let https = require('https')

let evmJsonRpcRequest = async requestObject => {
    if (!requestObject.blockNumber) requestObject.blockNumber = "latest";
    let { rpcUrl, port, method, params, whichProtocol /* 0 == http, 1 == https */, blockNumber } = requestObject;
    if (
        method == "eth_getBalance" ||
        method == "eth_getCode" ||
        method == "eth_getStorageAt" ||
        method == "eth_call"
    ) params.push(blockNumber);
    let requestPromise = new Promise((resolve, reject) => {
        let options = {
            host: rpcUrl.match(/[^\/]+/)[0],
            port: port,
            path: rpcUrl.match(/\/.*/)[0],
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let req = (whichProtocol ? https : http).request(options, res => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(data);
            });
        });
        req.write(JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 0
        }));
        req.end();
    });
    //console.log(await requestPromise);
    return JSON.parse(await requestPromise);
};

module.exports = exports = evmJsonRpcRequest;
