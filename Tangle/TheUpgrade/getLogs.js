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

let transfer = sig("Transfer(address,address,uint256)");
let rebase = sig("RebaseEvent(int256)");
let sync = sig("Sync(uint112,uint112)");
let rpcUrl = "localhost/";
let address = "0xa810ad36e545e3db009cc8ca53930f3d76a7e8e9";
let topics = [[
    transfer,
    sync
]];
let startingBlock = "0x0";
let logs = [];
(async () => {

    let newLogs;
    do {
        let payload = {
            rpcUrl: rpcUrl,
            whichProtocol: 1,
            port: 443,
            method: "eth_newFilter",
            params: [{
                fromBlock: startingBlock,
                toBlock: "latest",
                address: address,
                topics: topics
            }]
        };
        let filterId = (await evmJsonRpcRequest(payload)).result;
        payload.params = [filterId];
        payload.method = "eth_getFilterLogs";
        newLogs = (await evmJsonRpcRequest(payload)).result;
        startingBlock = newLogs[newLogs.length - 1].blockNumber;
        if (newLogs.length > 1) newLogs = newLogs.filter(log => log.blockNumber != startingBlock);
        logs.push(...newLogs);
    } while (newLogs && newLogs.length > 1);
    fs.writeFileSync("arsuLpLogs.txt", JSON.stringify(logs));

})();
