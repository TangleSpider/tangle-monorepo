let keccak256 = require("@ethersproject/keccak256").keccak256;
let evmJsonRpcRequest = require("../evmJsonRpcRequest.js");
let sig = (selector, short = false) => {
    return keccak256(
        "0x" +
        selector.split('').map(c => {
            return c.charCodeAt(0).toString(16);
        }).join('')
    ).substr(0, short ? 10 : undefined);
};
let fs = require("fs");

let sync = sig("Sync(uint112,uint112)");
let transfer = sig("Transfer(address,address,uint256)");

let rpcUrl = "rpc.ftm.tools/";
let address = "0xcff6c70e174a4b8c020a81cebb75ce131c285916";
let topics = [[
    sync,
    transfer
]];
(async () => {
    let newLogs;
    let payload = {
        rpcUrl: rpcUrl,
        whichProtocol: 1,
        port: 443,
        method: "eth_getLogs",
        params: [{
            fromBlock: "0x0",
            toBlock: "latest",
            address: address,
            topics: topics
        }]
    };
    let response = await evmJsonRpcRequest(payload)
    let logs = response.result;
    fs.writeFileSync("logs.txt", JSON.stringify(logs));
})();
