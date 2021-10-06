let https = require('https')

let evmJsonRpcRequest = async requestObject => {
    let { rpcUrl, method, params } = requestObject;
    if (
        method == "eth_getBalance" ||
        method == "eth_getCode" ||
        method == "eth_getTransactionCount" ||
        method == "eth_getStorageAt" ||
        method == "eth_call"
    ) params.push("latest");
    let requestPromise = new Promise((resolve, reject) => {
        let options = {
            host: rpcUrl.match(/[^\/]+/)[0],
            port: 443,
            path: rpcUrl.match(/\/.*/)[0],
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let req = https.request(options, res => {
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
    return JSON.parse(await requestPromise);
};

module.exports = exports = evmJsonRpcRequest;
