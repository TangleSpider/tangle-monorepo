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
let reflect = sig("Reflect(address,uint256)");

let rpcUrl = "api.avax.network/ext/bc/C/rpc";
let address = "0xa02f0Bf793ff232fE0A7511C900494E99F0F674d";
let topics = [[
    sync,
    transfer
]];
(async () => {
    let logs = [];
    let payload = {
        rpcUrl: rpcUrl,
        whichProtocol: 1,
        port: 443,
        method: "eth_blockNumber",
        params: []
    };
    let response = await evmJsonRpcRequest(payload);
    console.log(response);
    let lastBlock = BigInt(response.result) - BigInt(10);
    let firstBlock = BigInt(5533715);
    let chunks = 32n;
    let chunkSize = (lastBlock - firstBlock) / chunks;
    for (let i = 0n; i < chunks; i += 1n) {
        console.log([
            "0x" + (firstBlock + chunkSize * i + 1n).toString(16),
            "0x" + (firstBlock + chunkSize * (i + 1n)).toString(16),
            i + 1n,
            chunks
        ]);
        payload = {
            rpcUrl: rpcUrl,
            whichProtocol: 1,
            port: 443,
            method: "eth_getLogs",
            params: [{
                fromBlock: "0x" + (firstBlock + chunkSize * i + 1n).toString(16),
                toBlock: "0x" + (firstBlock + chunkSize * (i + 1n)).toString(16),
                address: address,
                topics: topics
            }]
        };
        response = await evmJsonRpcRequest(payload);
        console.log(response);
        /*if (!response.result)
            console.log(response);*/
        if (response.result.length)
            logs = [...logs, ...response.result];
        //console.log(JSON.stringify(logs));
    }
    fs.writeFileSync("logs.txt", JSON.stringify(logs));
    /*let logs = response.result;
    if (logs.length)
        fs.writeFileSync("logs.txt", JSON.stringify(logs));*/
})();
