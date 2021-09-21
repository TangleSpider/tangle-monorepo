require("dotenv").config();
let connection = require("./js/getMysqlConnection.js");
require("./js/initializeLiquidityAddTable.js")(connection);
let getEnv = require("./js/getEnv.js");
let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
let sig = require("./js/sig.js");

let processes = {};

let initProcess = (name, func) => {
    processes[name] = {};
    processes[name].queue = [];
    processes[name].running = false;
    processes[name].process = func;
    processes[name].start = function () {
        if (this.running || !this.queue.length) return;
        this.running = true;
        this.process(this.queue[0]);
    };
    processes[name].interval = setInterval(processes[name].start.bind(processes[name]), 1000);
}

let estimateGas = async (rpcUrl, port, sigText, from, to, extraData = '') => {
    console.log(await evmJsonRpcRequest({
        rpcUrl: rpcUrl,
        port: port,
        method: "eth_estimateGas",
        params: [{
            from: from,
            to: to,
            data: sig(sigText) + extraData
        }]
    }));
};

initProcess(
    "getliquidityAddRequestId",
    async function (queueObject) {
        let next = () => {

            // things to do when process is finished

            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        this.queue.shift();

        // things to do during processing
        queueObject.id = await getPendingLiquidityAddId();
        //console.log(id);
        /*await estimateGas(
            getEnv("BSC_RPC_URL"),
            "transferFrom(address,address,uint256,uint256)",
            queueObject.relayerAddress,
            queueObject.relayerContractAddress,
            queueObject.msgSender + queueObject.relayerContractAddress + transferAmount
        );
        console.log(g0);*/
        liquidityAddRequest(queueObject);
        next();
    }
);

let liquidityAddRequest = async (queueObject) => {
    console.log(queueObject.id);
    console.log(await estimateGas(
        "localhost/",
        8000,
        "transferFrom(address,address,uint256,uint256)",
        queueObject.relayerAddress,
        queueObject.relayerContractAddress,
        queueObject.data//msgSender + queueObject.relayerContractAddress + queueObject.transferAmount
    ));
};

let getPendingLiquidityAddId = () => {
    return new Promise((resolve, reject) => {
        connection.query("select id from pendingAddLiquidityRequests where status0 = 1 and status1 = 1 order by id asc limit 1", (err, res, fields) => {
            if (err) {
                reject(err);
            } else {
                if (res.length) {
                    connection.query("insert into pendingAddLiquidityRequests (id) values (" + parseInt(res[0].id) + ")", (err, res2, fields) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(res[0].id);
                        }
                    });
                }
                if (!res.length) {
                    connection.query("select id from pendingAddLiquidityRequests where status0 != 1 or status1 != 1 order by id desc", (err, res, fields) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (res.length) {
                                connection.query("insert into pendingAddLiquidityRequests (id) values (" + (parseInt(res[0].id) + 1) + ")", (err, res2, fields) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(res[0].id + 1);
                                    }
                                });
                            }
                            if (!res.length) {
                                connection.query("insert into pendingAddLiquidityRequests (id) values (0)", (err, res2, fields) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(0);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    });
};

processes["getliquidityAddRequestId"].queue.push({
    relayerAddress: "0xe1a811bDFb656Dc47a7262dbdE31071d9A916B1a",
    relayerContractAddress: "0x2F96f61a027B5101E966EC1bA75B78f353259Fb3",
    data: "000000000000000000000000e1a811bdfb656dc47a7262dbde31071d9a916b1a0000000000000000000000002f96f61a027b5101e966ec1ba75b78f353259fb300000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000"
});

/*(async () => {
    for (let i = 0; i < 10; i++) {
        (async () => {
            processes["getliquidityAddRequestId"].queue.push({});
        })();
    }
})();*/
