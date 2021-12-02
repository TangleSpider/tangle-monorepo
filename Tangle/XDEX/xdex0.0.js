require("dotenv").config();
let connection = require("./js/getMysqlConnection.js");
require("./js/initializePendingAddLiquidityRequestsTable.js")(connection);
require("./js/initializeLpBalancesTable.js")(connection);
require("./js/initializePairsTable.js")(connection);
let getEnv = require("./js/getEnv.js");
let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
let sig = require("./js/sig.js");
let processes = require("./js/processes.js");
let keccak256 = require("@ethersproject/keccak256").keccak256;
let bodyParser = require("body-parser");
let express = require("express");
let app = express();
app.use(bodyParser.json());

let gestGas = async (queueObject, whichTx) => {
    queueObject.TangleRelayerContract = "0xAf1843657F00F8C048139B7103784fdeFC403702";
    queueObject.TangleRelayer = "0x6CBE9E9e7A4FBbB0AafB065dAE308633c19D1c6D";
    console.log(sig("transferFromToken(address,address,address,uint256,uint256,uint256)") +
    queueObject.token0.substr(2).padStart(64, '0') +
    queueObject.msgSender.substr(2).padStart(64, '0') +
    queueObject.TangleRelayerContract.substr(2).padStart(64, '0') +
    queueObject["amount" + whichTx].substr(2) +
    queueObject.id.toString(16).padStart(64, '0') +
    "".padStart(64, '0'));
    let gasEstimate = await evmJsonRpcRequest({
        whichProtocol: 0, // 0 == http, 1 == https
        rpcUrl: "localhost/", // rpcUrl(P14)
        port: 8000, // 8000 for private, 443 for normal https
        method: "eth_estimateGas",
        params: [{
            from: queueObject.TangleRelayer,
            to: queueObject.TangleRelayerContract,
            data:
                sig("transferFromToken(address,address,address,uint256,uint256,uint256)") +
                queueObject.token0.substr(2).padStart(64, '0') +
                queueObject.msgSender.substr(2).padStart(64, '0') +
                queueObject.TangleRelayerContract.substr(2).padStart(64, '0') +
                queueObject["amount" + whichTx].substr(2) +
                queueObject.id.toString(16).padStart(64, '0') +
                "".padStart(64, '0')
        }]
    });
    console.log(gasEstimate);
    gasEstimate = "0x" + gasEstimate.result.substr(2).padStart(64, '0');
    connection.query(
        `update pendingAddLiquidityRequests set
        gas0 = "` + gasEstimate + `",
        timestamp = ` + Date.now() + `
        where id = ` + queueObject.id + `;`,
    (err, res2, fields) => {
        if (err) {
            throw err;
        } else {
            connection.query(`select gas0, gas1 from pendingAddLiquidityRequests where id = ` + queueObject.id + `;`,
            (err, res, fields) => {
                if (err) {
                    throw err;
                } else {
                    if (parseInt(res[0].gas0) && parseInt(res[0].gas1)) {
                        let paymentAmount = "0x" + BigInt(parseInt(res[0].gas0 * (p + 1))).toString(16).padStart(64, '0');
                        connection.query(
                            `update pendingAddLiquidityRequests set
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
    });
};
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
processes.init(
    "getliquidityAddRequestId",
    async function (queueObject) {
        let next = () => {
            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        this.queue.shift();
        queueObject.id = await getPendingLiquidityAddId();
        gestGas(queueObject, 0);
        //gest(queueObject, 1);
        next();
    }
);

let estimateAmounts = requestObject => {
    with (requestObject) {
        let getliquidityAddRequestId = () => {
            delete amount0Desired;
            delete amount1Desired;
            delete amount0Min;
            delete amount1Min;
            processes["getliquidityAddRequestId"].queue.push(requestObject);
        };
        let pair = keccak256(token0 + chain0.substr(2) + token1.substr(2) + chain1.substr(2));
        connection.query("select reserve0, reserve1 from pairs where pair = " + pair, (err, res, fields) => {
            if (err) {
                console.log(err);
            } else {
                if (!res.length) {
                    [requestObject.amount0, requestObject.amount1] = [amount0Desired, amount1Desired];
                    getliquidityAddRequestId();
                } else {
                    let [reserve0, reserve1] = [res[0].reserve0, res[1].reserve1];
                    let amount1Optimal = BigInt(amount0) * BigInt(reserve1) / BigInt(reserve0);
                    if (amount1Optimal <= amount1Desired) {
                        [requestObject.amount0, requestObject.amount1] = [amount0Desired, amount1Optimal];
                        getliquidityAddRequestId();
                    } else {
                        let amount0Optimal = BigInt(amount1Desired) * BigInt(reserve0) / BigInt(reserve1);
                        [requestObject.amount0, requestObject.amount1] = [amount0Optimal, amount1Desired];
                        getliquidityAddRequestId();
                    }
                }
            }
        });
    }
};
let handleAddLiquidityRequest = async requestObject => {
    with (requestObject) {
        if (chain1 + token1.substr(2) < chain0 + token0.substr(2))
            [
                requestObject.chain0,
                requestObject.chain1,
                requestObject.token0,
                requestObject.token1,
                requestObject.amount0Desired,
                requestObject.amount1Desired,
                requestObject.amount0Min,
                requestObject.amount1Min
            ] = [
                chain1,
                chain0,
                token1,
                token0,
                amount1Desired,
                amount0Desired,
                amount1Min,
                amount0Min
            ];
    }
    estimateAmounts(requestObject);
};
let xdexRequest = async requestObject => {
    if (requestObject.req.body.method == "addLiquidity") {
        handleAddLiquidityRequest(requestObject.req.body);
    }
};

app.post("/XDEX", async (req, res) => {
    req.body.res = res;
    xdexRequest({ req: req });
});
app.get('/*', (req, res) => {
    if (req.url == '/') req.url = "/xdex.html";
    res.sendFile(req.url, { root: "." });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}...`);
});
