let server = require("./js/server.js");
let connection = require("./js/getMysqlConnection.js");
require("./js/initializeAddLiquidityRequestsTable.js")(connection);
require("./js/initializeLpBalancesTable.js")(connection);
require("./js/initializePairsTable.js")(connection);
let processes = require("./js/processes.js");
let keccak256 = require("@ethersproject/keccak256").keccak256;
let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
let sig = require("./js/sig.js");

let getEvmJsonRpcRequestParameters = (requestObject, whichTx) => {
    let evmJsonRpcRequestParameters = {
        method: "eth_estimateGas",
        params: [{
            from: "0x6CBE9E9e7A4FBbB0AafB065dAE308633c19D1c6D", // TangleRelayer
            data:
                sig("transferFrom(address,address,address,uint256,uint256,uint256)") +
                requestObject.data.tokens[whichTx].substr(2).padStart(64, '0') +
                requestObject.msgSender.substr(2).padStart(64, '0')
        }]
    };
    switch (requestObject.data.chains[whichTx]) {
        case "0x000000000000000000000000000000000000000000000000000000000000000e": // P14
            evmJsonRpcRequestParameters.whichProtocol = 0;
            evmJsonRpcRequestParameters.rpcUrl = "localhost/";
            evmJsonRpcRequestParameters.port = 8000;
            evmJsonRpcRequestParameters.params[0].to = "0xb6D0ae90e956E7AC1f86b925DD58aB99c6A957a9"; // TangleRelayerContract
            evmJsonRpcRequestParameters.params[0].data += evmJsonRpcRequestParameters.params[0].to.substr(2).padStart(64, '0')
            break;
        case "0x000000000000000000000000000000000000000000000000000000000000000f": // P15
            evmJsonRpcRequestParameters.whichProtocol = 0;
            evmJsonRpcRequestParameters.rpcUrl = "localhost/";
            evmJsonRpcRequestParameters.port = 8001;
            evmJsonRpcRequestParameters.params[0].to = "0x2F96f61a027B5101E966EC1bA75B78f353259Fb3"; // TangleRelayerContract
            evmJsonRpcRequestParameters.params[0].data += evmJsonRpcRequestParameters.params[0].to.substr(2).padStart(64, '0')
            break;
    }
    evmJsonRpcRequestParameters.params[0].data +=
        requestObject.data.amounts[whichTx].substr(2) +
        requestObject.id.toString(16).padStart(64, '0') +
        '0'.padStart(64, '0');
    return evmJsonRpcRequestParameters;
};
let gestGas = async (requestObject, whichTx) => {
    let evmJsonRpcRequestParameters = getEvmJsonRpcRequestParameters(requestObject, whichTx);
    if (!requestObject.data.gases) requestObject.data.gases = [null, null];
    requestObject.data.gases[whichTx] = "0x" + (await evmJsonRpcRequest(evmJsonRpcRequestParameters)).result.substr(2).padStart(64, '0');
    if (requestObject.data.gases.indexOf(null) != -1) return;
    let p = BigInt(4 /* profitMargin */ + 1);
    let paymentAmount = "0x" + (requestObject.data.gases.reduce((c, p) => { return BigInt(c) + BigInt(p); }) * p).toString(16).padStart(64, '0');
    let responseObject = {
        TangleRelayerContract: evmJsonRpcRequestParameters.params[0].to,
        paymentAmount: paymentAmount,
        id: requestObject.id,
        chain: requestObject.data.chains[whichTx].replace(/(0x)0+/, "$1")
    }
    console.log("requestObject", ({ res, ...notRes } = requestObject, notRes));
    console.log("responseObject", responseObject);
    requestObject.res.json(responseObject);
    /*connection.query(
        `update addLiquidityRequests set
        gas` + whichTx + ` = "` + gasEstimate + `",
        timestamp = ` + Date.now() + `
        where id = ` + requestObject.id + `;`,
    (err, res, fields) => {
        if (err) {
            throw err;
        } else {
            connection.query(`select gas0, gas1 from addLiquidityRequests where id = ` + queueObject.id + `;`,
            (err, res, fields) => {
                if (err) {
                    throw err;
                } else {
                    if (parseInt(res[0].gas0) && parseInt(res[0].gas1)) {
                        let paymentAmount = "0x" + BigInt(parseInt(res[0].gas0 * (p + 1))).toString(16).padStart(64, '0');
                        connection.query(
                            `update addLiquidityRequests set
                            paymentAmount = ` + paymentAmount + `,
                            gas0 = ` + res[0].gas0 + `,
                            gas1 = ` + res[0].gas1 + `,
                            chain0 = ` + queueObject.chain0 + `,
                            chain1 = ` + queueObject.chain1 + `,
                            amount0 = default,
                            amount1 = default,
                            timestamp = ` + Date.now() + `
                            where id = ` + parseInt(res[0].id) + `;`,
                        (err, res2, fields) => {
                            if (err) {
                                reject(err);
                            } else {
                                let p = 1;

                                queueObject.paymentAmount = paymentAmount;
                                queueObject.chain = queueObject["chain" + whichTx];
                                queueObject.method = 0;
                                let response = queueObject.res;
                                delete queueObject.res;
                                delete queueObject.msgSender;
                                delete queueObject.chain0;
                                delete queueObject.chain1;
                                delete queueObject.token0;
                                delete queueObject.token1;
                                delete queueObject.amount0;
                                delete queueObject.amount1;
                                console.log(queueObject);
                                response.json(queueObject);
                            }
                        });
                    }
                }
            });
        }
    });*/
};
let estimateAmounts = requestObject => {
    let { chains, tokens, amountsDesired } = requestObject.data;
    let gestGases = amounts => {
        requestObject.data = ({ amountsDesired, amountsMin, ...keep } = requestObject.data, keep);
        requestObject.data.amounts = amounts;
        //console.log(({ res, ...notRes } = requestObject, notRes));
        [0, 1].forEach(i => { gestGas(requestObject, i) });
    };
    let pair = keccak256(chains[0] + tokens[0].substr(2) + chains[1].substr(2) + tokens[1].substr(2));
    connection.query("select reserve0, reserve1 from pairs where pair = " + pair, (err, res, fields) => {
        if (err) {
            console.log(err);
        } else {
            if (!res.length) {
                gestGases([amountsDesired[0], amountsDesired[1]]);
            } else {
                let [reserve0, reserve1] = [res[0].reserve0, res[1].reserve1];
                let amount1Optimal = BigInt(amountsDesired[0]) * BigInt(reserve1) / BigInt(reserve0);
                if (amount1Optimal <= amountsDesired[1]) {
                    gestGases([amountsDesired[0], amount1Optimal]);
                } else {
                    let amount0Optimal = BigInt(amountsDesired[1]) * BigInt(reserve0) / BigInt(reserve1);
                    gestGases([amount0Optimal, amountsDesired[1]]);
                }
            }
        }
    });
};
let getPendingLiquidityAddId = requestObject => {
    return new Promise((resolve, reject) => {
        connection.query("select id from addLiquidityRequests where status0 = 1 and status1 = 1 order by id asc limit 1", (err, res, fields) => {
            if (err) {
                reject(err);
            } else {
                if (res.length) {
                    connection.query(
                        `update addLiquidityRequests set
                        paymentAmount = default,
                        gas0 = default,
                        gas1 = default,
                        status0 = default,
                        status1 = default,
                        chain0 = ` + requestObject.data.chains[0] + `,
                        chain1 = ` + requestObject.data.chains[1] + `,
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
                    connection.query("select id from addLiquidityRequests where status0 != 1 or status1 != 1 order by id desc", (err, res, fields) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (res.length) {
                                connection.query("insert into addLiquidityRequests (id) values (" + (parseInt(res[0].id) + 1) + ")", (err, res2, fields) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(res[0].id + 1);
                                    }
                                });
                            }
                            if (!res.length) {
                                connection.query("insert into addLiquidityRequests (id) values (0)", (err, res2, fields) => {
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
processes.init(
    "getliquidityAddRequestId",
    async function (requestObject) {
        let next = () => {
            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        this.queue.shift();
        requestObject.id = await getPendingLiquidityAddId(requestObject);
        //console.log(({ res, ...notRes } = requestObject, notRes));
        estimateAmounts(requestObject);
        next();
    }
);

let handleAddLiquidityRequest = async requestObject => {
    let { chains, tokens } = requestObject.data;
    if (chains[1] + tokens[1] < chains[0] + tokens[0])
        for (key in requestObject.data) requestObject.data[key].reverse();
    processes["getliquidityAddRequestId"].queue.push(requestObject);
};

server.addPostHandler(
    "/xdexAddLiquidity",
    (req, res) => {
        req.body.res = res;
        handleAddLiquidityRequest(req.body);
    }
);
