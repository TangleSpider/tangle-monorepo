import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let fetch = require("node-fetch");

let evmJsonRpcRequest = async requestObject => {
    let { rpcUrl, method, params } = requestObject;
    if (
        method == "eth_getBalance" ||
        method == "eth_getCode" ||
        method == "eth_getTransactionCount" ||
        method == "eth_getStorageAt" ||
        method == "eth_call"
    ) params.push("latest");
    return fetch(rpcUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 0
        })
    })
    .then(response => {
        return response.json();
    });
};

export { evmJsonRpcRequest };
