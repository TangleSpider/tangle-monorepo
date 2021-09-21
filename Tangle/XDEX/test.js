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

let estimateAndSaveGas = async (queueObject, whichTx) => {
    let { rpcUrl, port, from, to, sigText, data, id } = queueObject;
    let gasEstimate = await evmJsonRpcRequest({
        rpcUrl: rpcUrl,
        port: port,
        method: "eth_estimateGas",
        params: [{
            from: from,
            to: to,
            data: sig(sigText) + data
        }]
    });
    gasEstimate = "0x" + gasEstimate.result.substr(2).padStart(64, '0');
    connection.query(
        `update pendingAddLiquidityRequests set
        gas0 = "` + gasEstimate + `",
        timestamp = ` + Date.now() + `
        where id = ` + id + `;`,
    (err, res2, fields) => {
        if (err) {
            throw err;
        } else {
            console.log(id, gasEstimate);
            connection.query(`select gas0, gas1 from pendingAddLiquidityRequests where id = ` + id + `;`,
            (err, res, fields) => {
                if (err) {
                    throw err;
                } else {
                    console.log(res, id, gasEstimate);
                    if (parseInt(res[0].gas0)/* && parseInt(res[0].gas0)*/) {
                        queueObject.gas0 = res[0].gas[0];
                        //queueObject.gas1 = res[0].gas[1];
                        calculateTanglePayment(queueObject);
                    }
                }
            });
        }
    });
};

let calculateTanglePayment = async queueObject => {
    console.log(queueObject);
});

initProcess(
    "getliquidityAddRequestId",
    async function (queueObject) {
        let next = () => {
            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        this.queue.shift();
        queueObject.id = await getPendingLiquidityAddId();
        estimateAndSaveGas(queueObject, 0);
        //estimateAndSaveGas(queueObject, 1);
        next();
    }
);

let getPendingLiquidityAddId = () => {
    return new Promise((resolve, reject) => {
        connection.query("select id from pendingAddLiquidityRequests where status0 = 1 and status1 = 1 order by id asc limit 1", (err, res, fields) => {
            if (err) {
                reject(err);
            } else {
                if (res.length) {
                    connection.query(
                        `update pendingAddLiquidityRequests set
                        paymentAmount = default,
                        gas0 = default,
                        gas1 = default,
                        status0 = default,
                        status1 = default,
                        chain0 = default,
                        chain1 = default,
                        amount0 = default,
                        amount1 = default,
                        timestamp = ` + Date.now() + `
                        where id = ` + parseInt(res[0].id) + `;`,
                    (err, res2, fields) => {
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
    rpcUrl: "localhost/",
    port: 8000,
    sigText: "transferFrom(address,address,uint256,uint256)",
    from: "0xe1a811bDFb656Dc47a7262dbdE31071d9A916B1a", // relayerAddress
    to: "0x2F96f61a027B5101E966EC1bA75B78f353259Fb3", // relayerContractAddress
    data: "000000000000000000000000e1a811bdfb656dc47a7262dbde31071d9a916b1a0000000000000000000000002f96f61a027b5101e966ec1ba75b78f353259fb300000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000"
});
