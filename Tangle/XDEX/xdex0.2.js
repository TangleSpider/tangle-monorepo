let processes = require("./js/processes.js");
let keccak256 = require("@ethersproject/keccak256").keccak256;
let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
let sig = require("./js/sig.js");

let profitMargin = 4;

let hexZeroes = bytes => {
    return "0x" + "".padStart(bytes * 2, '0')
};
let toPaddedHexString = (num, bytes) => {
    return "0x" + (num).toString(16).padStart(bytes * 2, '0')
};
let tables = [
    {
        name: "balances",
        createDefinition:
            `pair char(42),
            owner char(42),
            amount char(66)`,
        reset: true,
    },
    {
        name: "addLiquidityRequests",
        createDefinition:
            `id int unique,
            msgSender char(42) default "${hexZeroes(20)}",
            paymentAmount char(66) default "${hexZeroes(32)}",
            paidAmount char(66) default "${hexZeroes(32)}",
            gas0 char(66) default "${hexZeroes(32)}",
            gas1 char(66) default "${hexZeroes(32)}",
            status0 tinyint default 0,
            status1 tinyint default 0,
            chain0 char(66) default "${hexZeroes(32)}",
            chain1 char(66) default "${hexZeroes(32)}",
            token0 char(42) default "${hexZeroes(20)}",
            token1 char(42) default "${hexZeroes(20)}",
            amount0 char(66) default "${hexZeroes(32)}",
            amount1 char(66) default "${hexZeroes(32)}",
            timestamp bigint default 0`,
        reset: true
    },
    {
        name: "syncedBlockNumbers",
        createDefinition:
             `chain char(66),
             syncedPaymentsBlock char(66) default "${hexZeroes(32)}"`,
        reset: true,
        postCreate:
            connection => {
                return Promise.all([14, 15].map(chainId =>
                    new Promise((resolve, reject) => {
                        connection.query(
                            `insert
                            syncedBlockNumbers
                            (chain)
                            values ("${toPaddedHexString(chainId, 32)}")`,
                        (err, res) => {
                            if (err) throw err;
                            console.log(`Initialized chainId ${chainId} in syncedBlockNumbers`);
                            if (!err) resolve(null);
                        });
                    })
                ));
            }
    }
];
let initializeAllTables = connection => {
    return Promise.all(
        tables.map(table =>
            table.reset ?
                require("./js/initTable.js")(connection, table) :
                true
        )
    );
};
let getAddLiquidityRequestId = async (connection, requestObject) => {
    return new Promise((resolve, reject) => {
        connection.query(
            `select
            id
            from addLiquidityRequests
            where status0 = 1 and status1 = 1
            order by id asc
            limit 1`,
        (err, res) => {
            if (err) throw err;
            if (!err && res.length)
                connection.query(
                    `update addLiquidityRequests set
                    msgSender = default,
                    paymentAmount = default,
                    paidAmount = default,
                    gas0 = default,
                    gas1 = default,
                    status0 = default,
                    status1 = default,
                    chain0 = default,
                    chain1 = default,
                    token0 = default,
                    token1 = default,
                    amount0 = default,
                    amount1 = default,
                    timestamp = ${Date.now()}`,
                (err, res) => {
                    if (err) throw err;
                    if (!err) resolve(res[0].id);
                });
            if (!err && !res.length)
                connection.query(
                    `select
                    id
                    from addLiquidityRequests
                    where status0 != 1 or status1 != 1
                    order by id desc
                    limit 1`,
                (err, res) => {
                    if (err) throw err;
                    if (!err && res.length) {
                        let id = parseInt(res[0].id) + 1;
                        connection.query(
                            `insert
                            addLiquidityRequests
                            (id, timestamp)
                            values (${id}, ${Date.now()})`,
                        (err, res) => {
                            if (err) throw err;
                            if (res) resolve(id);
                        });
                    }
                    if (!err && !res.length)
                        connection.query(
                            `insert
                            addLiquidityRequests
                            (id, timestamp)
                            values (0, ${Date.now()})`,
                        (err, res) => {
                            if (err) throw err;
                            if (res) resolve(0);
                        });
                });
        });
    });
};
let estimateAmountsAddLiquidityRequest = (connection, requestObject) => {
    return new Promise((resolve, reject) => {
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
                    resolve([amountsDesired[0], amountsDesired[1]]);
                } else {
                    let [reserve0, reserve1] = [res[0].reserve0, res[1].reserve1];
                    let amount1Optimal = BigInt(amountsDesired[0]) * BigInt(reserve1) / BigInt(reserve0);
                    if (amount1Optimal <= amountsDesired[1]) {
                        resolve([amountsDesired[0], amount1Optimal]);
                    } else {
                        let amount0Optimal = BigInt(amountsDesired[1]) * BigInt(reserve0) / BigInt(reserve1);
                        resolve([amount0Optimal, amountsDesired[1]]);
                    }
                }
            }
        });
    });
};
let getChainData = chain => {
    let chainData = {};
    switch (chain) {
        case "0x000000000000000000000000000000000000000000000000000000000000000e":
            chainData.whichProtocol = 0;
            chainData.rpcUrl = "localhost/";
            chainData.port = "8000";
            chainData.TangleRelayerContract = "0x6E8c185F2Fb1C2Dd07B052d107c47F9287ea0AF2";
            chainData.TangleRelayer = "0x6CBE9E9e7A4FBbB0AafB065dAE308633c19D1c6D";
            break;
        case "0x000000000000000000000000000000000000000000000000000000000000000f":
            chainData.whichProtocol = 0;
            chainData.rpcUrl = "localhost/";
            chainData.port = "8001";
            chainData.TangleRelayerContract = "0xAf1843657F00F8C048139B7103784fdeFC403702";
            chainData.TangleRelayer = "0x6CBE9E9e7A4FBbB0AafB065dAE308633c19D1c6D";
            break;
    }
    return chainData;
};
let getGasAddLiquidityRequest = (requestObject, whichTx) => {
    return new Promise(async (resolve, reject) => {
        let evmJsonRpcRequestParameters = {};
        Object.assign(evmJsonRpcRequestParameters, requestObject.data.chainData[whichTx]);
        evmJsonRpcRequestParameters.method = "eth_estimateGas";
        evmJsonRpcRequestParameters.params = [{
            from: evmJsonRpcRequestParameters.TangleRelayer, // TangleRelayer
            to: evmJsonRpcRequestParameters.TangleRelayerContract,
            data:
                sig("transferFrom(address,address,address,uint256,uint256,uint256)") +
                requestObject.data.tokens[whichTx].substr(2).padStart(64, '0') +
                requestObject.msgSender.substr(2).padStart(64, '0') +
                evmJsonRpcRequestParameters.TangleRelayerContract.substr(2).padStart(64, '0') +
                requestObject.data.amounts[whichTx].substr(2) +
                requestObject.id.toString(16).padStart(64, '0') +
                '0'.padStart(64, '0')
        }];
        resolve("0x" + (await evmJsonRpcRequest(evmJsonRpcRequestParameters)).result.substr(2).padStart(64, '0'));
    });
};
let getBalance = (requestObject, whichTx) => {
    return new Promise(async (resolve, reject) => {
        let evmJsonRpcRequestParameters = requestObject.data.chainData[whichTx];
        evmJsonRpcRequestParameters.method = "eth_getBalance";
        evmJsonRpcRequestParameters.params = [evmJsonRpcRequestParameters.TangleRelayer];
        resolve((await evmJsonRpcRequest(evmJsonRpcRequestParameters)).result);
    });
};
let getGasPrice = (requestObject, whichTx) => {
    return new Promise(async (resolve, reject) => {
        let evmJsonRpcRequestParameters = requestObject.data.chainData[whichTx];
        evmJsonRpcRequestParameters.method = "eth_gasPrice";
        delete evmJsonRpcRequestParameters.params;
        resolve((await evmJsonRpcRequest(evmJsonRpcRequestParameters)).result);
    });
};
let getPaymentDetails = requestObject => {
    return new Promise(async (resolve, reject) => {
        let ratios = [0, 1].map(i =>
            "0x" + (BigInt(requestObject.data.balances[i]) /
            BigInt(requestObject.data.gases[i]) /
            BigInt(requestObject.data.gasPrices[i])).toString(16)
        );
        let minRatio = ratios.reduce((c, p) => { return c < p ? c : p });
        let indexOfMinRatio = ratios.indexOf(minRatio);
        indexOfMinRatio = 1; // manual testing
        requestObject.responseObject.paymentChain = requestObject.data.chains[indexOfMinRatio];
        let p = (2 + 1);
        requestObject.responseObject.paymentAmount = "0x" + (BigInt(requestObject.data.gases[indexOfMinRatio]) * BigInt(requestObject.data.gasPrices[indexOfMinRatio]) * BigInt(p)).toString(16);
        requestObject.responseObject.TangleRelayerContract = getChainData(requestObject.data.chains[indexOfMinRatio]).TangleRelayerContract;
        requestObject.res.json(requestObject.responseObject);
    });
};
let handleAddLiquidityRequest = async (connection, requestObject) => {
    requestObject.data.chainData = [0, 1].map(i => getChainData(requestObject.data.chains[i]));
    requestObject.data.amounts = await estimateAmountsAddLiquidityRequest(connection, requestObject);
    //console.log(({ res, ...notRes } = requestObject, notRes));
    let gases = await Promise.all([0, 1].map(i => getGasAddLiquidityRequest(requestObject, i)));
    //console.log("gases", gases);
    let relayerBalances = await Promise.all([0, 1].map(i => getBalance(requestObject, i)));
    //console.log("relayerBalances", relayerBalances);
    let gasPrices = await Promise.all([0, 1].map(i => getGasPrice(requestObject, i)));
    //console.log("gasPrices", gasPrices);
    let ratios = [0, 1].map(i =>
        "0x" + (BigInt(relayerBalances[i]) /
        BigInt(gases[i]) /
        BigInt(gasPrices[i])).toString(16)
    );
    let minBalanceToGasCostRatio = ratios.reduce((c, p) => { return c < p ? c : p });
    let indexOfMinRatio = ratios.indexOf(minBalanceToGasCostRatio);
    indexOfMinRatio = 1; // manual override for testing
    //console.log("indexOfMinRatio", indexOfMinRatio);
    let p = (profitMargin + 1);
    requestObject.responseObject = {
        id: requestObject.id,
        paymentChain: requestObject.data.chains[indexOfMinRatio],
        paymentAmount:  "0x" + (BigInt(gases[indexOfMinRatio]) * BigInt(gasPrices[indexOfMinRatio]) * BigInt(p)).toString(16),
        TangleRelayerContract: requestObject.data.chainData[indexOfMinRatio].TangleRelayerContract
    }
    //console.log(({ res, ...notRes } = requestObject, notRes));
    requestObject.res.json(requestObject.responseObject);
    console.log(`Response object sent to addLiquidityRequest with id ${requestObject.id}`);
    await new Promise((resolve, reject) => {
        connection.query(
            `update addLiquidityRequests set
            msgSender = "${requestObject.msgSender}",
            paymentAmount = "${"0x" + requestObject.responseObject.paymentAmount.substr(2).padStart(64, '0')}",
            gas0 = "${"0x" + gases[0].substr(2).padStart(64, '0')}",
            gas1 = "${"0x" + gases[1].substr(2).padStart(64, '0')}",
            chain0 = "${"0x" + requestObject.data.chains[0].substr(2).padStart(64, '0')}",
            chain1 = "${"0x" + requestObject.data.chains[1].substr(2).padStart(64, '0')}",
            token0 = "${"0x" + requestObject.data.tokens[0].substr(2).padStart(40, '0')}",
            token1 = "${"0x" + requestObject.data.tokens[1].substr(2).padStart(40, '0')}",
            amount0 = "${"0x" + requestObject.data.amounts[0].substr(2).padStart(64, '0')}",
            amount1 = "${"0x" + requestObject.data.amounts[1].substr(2).padStart(64, '0')}",
            timestamp = ${Date.now()}`,
        (err, res) => {
            if (err) throw err;
            if (!err) resolve(null);
        });
    });
    console.log(`Updated addLiquidityRequest with id ${requestObject.id} in database`);
};
processes.init( // getLiquidityAddRequestId
    "getAddLiquidityRequestId",
    async function (queueObject) {
        let next = () => {
            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        let { connection, requestObject } = queueObject;
        this.queue.shift();
        requestObject.id = await getAddLiquidityRequestId(connection, requestObject);
        requestObject.responseObject = {
            id: requestObject.id
        };
        console.log(`Creating addLiquidityRequest with id ${requestObject.id}`);
        handleAddLiquidityRequest(connection, requestObject);
        next();
    }
);

(async () => {

    let connection = await require("./js/getMysqlConnection.js");
    console.log("MySQL connection acquired");
    await initializeAllTables(connection);
    console.log("All tables initialized");
    let server = require("./js/server.js");
    console.log("Server created");
    server.addPostHandler(
        "/xdexAddLiquidity",
        (req, res) => {
            req.body.res = res;
            let { chains, tokens } = req.body.data;
            if (chains[1] + tokens[1] < chains[0] + tokens[0])
                for (key in req.body.data) req.body.data[key].reverse();
            processes["getAddLiquidityRequestId"].queue.push({
                connection: connection,
                requestObject: req.body
            });
        }
    );
    console.log("Added post handler /xdexAddLiquidity to server");

    let paymentLogsFilters = {
        P15: {
            id: null,
            fromBlock: null
        }
    };
    paymentLogsFilters.P15.fromBlock = await new Promise((resolve, reject) => {
        connection.query(
            `select
            syncedPaymentsBlock
            from syncedBlockNumbers
            where chain = "0x000000000000000000000000000000000000000000000000000000000000000f"`,
        (err, res, field) => {
            if (err) {
                throw err;
            } else {
                resolve(res[0].syncedPaymentsBlock);
            }
        });
    });
    let chainData = await getChainData("0x000000000000000000000000000000000000000000000000000000000000000f");
    chainData.method = "eth_newFilter";
    chainData.params = [{
        fromBlock: "0x" + (BigInt(paymentLogsFilters.P15.fromBlock) + BigInt(1)).toString(16),
        toBlock: "latest",
        address: chainData.TangleRelayerContract,
        topics: ["0x243f8b521882d823492f47c974aec93c6b1f81e3f30a1eb6a6d18bd2fecf975b"]
    }]
    paymentLogsFilters.P15.id = (await evmJsonRpcRequest(chainData)).result;
    chainData.method = "eth_getFilterLogs";
    chainData.params = [paymentLogsFilters.P15.id];
    let processLog = async log => {
        let [id, method, value] = log.data.substr(2).match(/.{64}/g).map(a => "0x" + a);
        if (parseInt(method) == 0) {
            connection.query(
                `select
                paidAmount, paymentAmount
                from addLiquidityRequests
                where id = ${parseInt(id)}`,
            (err, res, fields) => {
                if (err) {
                    throw err;
                } else {
                    if (res.length) {
                        let { paidAmount, paymentAmount } = res[0];
                        connection.query(
                            `update addLiquidityRequests set
                            paidAmount = "` + "0x" + (BigInt(paidAmount) + BigInt(value)).toString(16).padStart(64, '0') + `"
                            where id = ` + parseInt(id),
                        (err, res, fields) => {
                            if (err) {
                                throw err;
                            } else {
                                console.log(
                                    `id: ${parseInt(id)}:
                                    Value ${BigInt(value)} found,
                                    paidAmount now ${BigInt(paidAmount) + BigInt(value)},
                                    >= paymentAmount ${BigInt(paymentAmount)}? ${BigInt(paidAmount) + BigInt(value) >= BigInt(paymentAmount)}`
                                );
                            }
                        });
                    }
                    if (!res.length) {
                        console.log(`\x1b[33m${"WARNING: Log found with no matching addLiquidityRequest id, ignoring log"}\x1b[0m`);
                    }
                }
            });
        }
    };
    let updateBlockNumber = blockNumber => {
        return new Promise((resolve, reject) => {
            connection.query(
                `update syncedBlockNumbers set
                syncedPaymentsBlock = "` + blockNumber + `"
                where chain = "` + "0x000000000000000000000000000000000000000000000000000000000000000f" + `";`,
            (err, res, fields) => {
                if (err) throw err;
                if (!err) {
                    chainData.method = "eth_getFilterChanges";
                    console.log(`Updated chain 0xf syncedPaymentsBlock to ${blockNumber.replace(/0+(?!x|$)/, "")}`);
                }
            });
        });
    };
    let checkLogs = setInterval(async () => {
        console.log("Checking logs...");
        let logs = (await evmJsonRpcRequest(chainData)).result;
        let blockNumber = BigInt(0);
        logs.forEach(log => {
            if (BigInt(log.blockNumber) > BigInt(blockNumber))
                blockNumber = "0x" + log.blockNumber.substr(2).padStart(64, '0');
            processLog(log);
        });
        if (blockNumber) await updateBlockNumber(blockNumber);
        if (!blockNumber) console.log("No logs found");
    }, 10000);



})();
