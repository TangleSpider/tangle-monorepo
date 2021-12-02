let keccak256 = require("@ethersproject/keccak256").keccak256;
let evmJsonRpcRequest = require("./evmJsonRpcRequest.js");
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
let TestEvent = sig("TestEvent(uint256)");
let TestEvent2 = sig("TestEvent(uint256,uint256)");

let rpcUrl = "localhost/";
let address = "0xD17584633bc8D190E5A14502976daD9640456D6d";
let topics = [[
    TestEvent2
]];
(async () => {
    let newLogs;
    let payload = {
        rpcUrl: rpcUrl,
        whichProtocol: 0,
        port: 8000,
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
    console.log(logs);
    fs.writeFileSync("logs.txt", JSON.stringify(logs));
})();
