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
let reflect = sig("ReflectEvent(address,uint256)");

let rpcUrl = "rpc.ftm.tools/";
let address = "0xcff6c70e174a4b8c020a81cebb75ce131c285916";
let topics = [[
    sync
]];
let startingBlock = "0x300000"; // AVAX - 0x300000
let toBlock = "0x325000"; // AVAX - 0x400000
let chunkSize = "0x25000"; // AVAX - 0x100000
let logs = [];
(async () => {
    let payload = {
        rpcUrl: rpcUrl,
        whichProtocol: 1,
        port: 443,
        method: "eth_blockNumber"
    };
    let lastAcceptedBlock = (await evmJsonRpcRequest(payload)).result;
    let newLogs;
    do {
        let payload = {
            rpcUrl: rpcUrl,
            whichProtocol: 1,
            port: 443,
            method: "eth_getLogs",
            params: [{
                fromBlock: "0x" + BigInt(startingBlock).toString(16),
                toBlock: "0x" + BigInt(toBlock).toString(16),
                address: address,
                topics: topics
            }]
        };
        //console.log(await evmJsonRpcRequest(payload));
        if (rpcUrl == "rpc.ftm.tools/" || rpcUrl == "api.avax.network/ext/bc/C/rpc") {
            let response = await evmJsonRpcRequest(payload)
            newLogs = response.result;
        } else {
            let filterId = (await evmJsonRpcRequest(payload)).result;
            payload.params = [filterId];
            payload.method = "eth_getFilterLogs";
            newLogs = (await evmJsonRpcRequest(payload)).result;
        }
        if (newLogs && newLogs.length) {
            if (newLogs[newLogs.length - 1].blockNumber == startingBlock) break;
            startingBlock = newLogs[newLogs.length - 1].blockNumber
            toBlock = "0x" + (BigInt(startingBlock) + BigInt(chunkSize)).toString(16);
            if (toBlock > lastAcceptedBlock) toBlock = lastAcceptedBlock;
            if (newLogs.length > 1) newLogs = newLogs.filter(log => log.blockNumber != startingBlock);
            logs.push(...newLogs);
        } else if (startingBlock != lastAcceptedBlock) {
            startingBlock = "0x" + (BigInt(startingBlock) + BigInt(chunkSize)).toString(16);
            toBlock = "0x" + (BigInt(startingBlock) + BigInt(chunkSize)).toString(16);
        }
        console.log(logs);
    } while (startingBlock != lastAcceptedBlock || (newLogs && (startingBlock != lastAcceptedBlock)));
    fs.writeFileSync("ftmTnglV3LpLogs.txt", JSON.stringify(logs));

})();
