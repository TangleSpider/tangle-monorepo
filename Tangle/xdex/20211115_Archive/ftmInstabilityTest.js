let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
let sig = require("./js/sig.js");

let testFunc = async () => {
    /*let blockNumber = (await evmJsonRpcRequest({
        whichProtocol: 1,
        rpcUrl: "rpc.ftm.tools/",
        port: 443,
        method: "eth_blockNumber"
    })).result;
    let blockData = await evmJsonRpcRequest({
        whichProtocol: 1,
        rpcUrl: "rpc.ftm.tools/",
        port: 443,
        method: "eth_call",
        params: [{
            to: "0x2f96f61a027b5101e966ec1ba75b78f353259fb3"
        }]
    });*/
    let formattedTimestamp = new Date().getUTCFullYear() + '-' + (new Date().getUTCMonth() + 1).toString().padStart(2, '0') + '-' + new Date().getUTCDate().toString().padStart(2, '0') + ' ' + new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0') + ':' + new Date().getSeconds().toString().padStart(2, '0') + " EST";
    console.log(
        formattedTimestamp, BigInt(
            "0x" +
            (await evmJsonRpcRequest({
                whichProtocol: 1,
                rpcUrl: "rpc.ftm.tools/",
                port: 443,
                method: "eth_call",
                params: [{
                    to: "0x2f96f61a027b5101e966ec1ba75b78f353259fb3",
                    data: sig("getAllAvailableRewards(address)") + 'aca9dc103c3a3bdeb3f953dd3b0209a8f41207c5'.padStart(64, '0')
                }]
            }))
            .result
            .substr(2)
            .match(/.{64}/g)[3]
        )
        .toString()
        .padStart(10, '0')
        .replace(/\d{9}$/, ".$&")
        .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',') +
        " TNGL");
};

testFunc();
setInterval(testFunc, 5000);
