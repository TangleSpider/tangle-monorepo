import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let fs = require("fs");

import { evmJsonRpcRequest } from "./evmJsonRpcRequest.js";
import { getEnv } from "./getEnv.js";
import { sig } from "./sig.js";

let call = async (rpcUrl, sigText, pairAddress, extraData = '') => {
    let rpcResponse = await evmJsonRpcRequest({
        rpcUrl: rpcUrl,
        method: "eth_call",
        params: [{
            to: pairAddress,
            data: sig(sigText) + extraData
        }]
    });
    return rpcResponse.result;
};

let updateData = async data => {
    data.lastUpdate = parseInt(Date.now() / 1000);
    for (let [i, a] of
        [["0x1A610A2AE3eb219797A471aC62904e1269Ab89B2", "ETH_TNGL"],
        ["0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc", "ETH_USD"],
        ["0x16A7e5c3C928618d9Ff554Cf9945F2087Bbe8db5", "BSC_TNGL"],
        ["0x58f876857a02d6762e0101bb5c46a8c1ed44dc16", "BSC_USD"],
        ["0xcff6c70e174a4b8c020a81cebb75ce131c285916", "FTM_TNGL"],
        ["0x2b4c76d0dc16be1c31d4c1dc53bf9b45987fc75c", "FTM_USD"],
        ["0x7870b42206ed0bc0c53bddedcf684c96f70327c1", "AVAX_TNGL"],
        ["0xe28984e1ee8d431346d32bec9ec800efb643eef4", "AVAX_USD"],
        ["0xb3b030f1494dcf1872152460c0e9c8b9ab74b39b", "ARB_TNGL"],
        ["0x905dfcd5649217c42684f23958568e533c711aa3", "ARB_USD"]].entries()
    ) {
        data.reserves[a[1]] = await call(
            getEnv(["ETH", "BSC", "FTM", "AVAX", "ARB"][parseInt(i / 2)] + "_RPC_URL"),
            "getReserves()",
            a[0]
        );
    }
    for (let a of
        [["ETH", "0xC7827a6CCc51176A986F05Ec8572244aecE6bf2e", "0x1A610A2AE3eb219797A471aC62904e1269Ab89B2"],
        ["BSC", "0xA536F6459E104666b2C08118F5A835De311D8E47", "0x16A7e5c3C928618d9Ff554Cf9945F2087Bbe8db5"],
        ["FTM", "0x2F96f61a027B5101E966EC1bA75B78f353259Fb3", "0xcff6c70e174a4b8c020a81cebb75ce131c285916"],
        ["AVAX", "0xAf1843657F00F8C048139B7103784fdeFC403702", "0x7870b42206ed0bc0c53bddedcf684c96f70327c1"],
        ["ARB", "0x69F012e4dD7C2dd75cd02CCb239E42642647e0cD", "0xb3b030f1494dcf1872152460c0e9c8b9ab74b39b"]]
    ) {
        for (let b of
            ["rewardMax",
            "rewardsLastRewardChange",
            "rewardConst",
            "startTime",
            "timeFromInitToLastRewardChange"]
        ) {
            data[a[0] + "_TNGL"][b] = await Promise.all(
                [0, 1, 2].map(async i => {
                    return await call(
                        getEnv(a[0] + "_RPC_URL"),
                        b + "(uint256)",
                        a[1],
                        i.toString().padStart(64, '0')
                    );
                })
            );
        }
        data[a[0] + "_TNGL"]["totalRewardableEvents2"] = await call(
            getEnv(a[0] + "_RPC_URL"),
            "totalRewardableEvents(uint256)",
            a[1],
            '2'.padStart(64, '0')
        );
        data[a[0] + "_TNGL"]["totalLPSupply"] = await call(
            getEnv(a[0] + "_RPC_URL"),
            "totalSupply()",
            a[2]
        );
        data[a[0] + "_TNGL"]["piecesPerUnit"] = await call(
            getEnv(a[0] + "_RPC_URL"),
            "piecesPerUnit()",
            a[1]
        );
    }
    fs.writeFileSync("data", JSON.stringify(data));
    return data;
};

export { updateData };
