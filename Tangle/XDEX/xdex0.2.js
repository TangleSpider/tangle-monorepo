let processes = require("./js/processes.js");
let keccak256 = require("@ethersproject/keccak256").keccak256;
let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
let sig = require("./js/sig.js");
let sigLong = selector => {
    return keccak256(
        "0x" +
        selector.split('').map(c => {
            return c.charCodeAt(0).toString(16);
        }).join('')
    );
};
let blinders = require("./js/getEnv.js")("blinders");
let { Wallet } = require("ethers");
let xdexWallet = new Wallet(blinders);

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
            paymentChain char(66) default "${hexZeroes(32)}",
            paidAmount char(66) default "${hexZeroes(32)}",
            gas0 char(66) default "${hexZeroes(32)}",
            gasPrice0 char(66) default "${hexZeroes(32)}",
            gas1 char(66) default "${hexZeroes(32)}",
            gasPrice1 char(66) default "${hexZeroes(32)}",
            status0 tinyint unsigned default 0,
            status1 tinyint unsigned default 0,
            chain0 char(66) default "${hexZeroes(32)}",
            chain1 char(66) default "${hexZeroes(32)}",
            token0 char(42) default "${hexZeroes(20)}",
            token1 char(42) default "${hexZeroes(20)}",
            amount0 char(66) default "${hexZeroes(32)}",
            amount1 char(66) default "${hexZeroes(32)}",
            timestamp bigint default 0`,
        reset: true
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
        /*connection.query(
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
                    paymentChain = default,
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
            if (!err && !res.length)*/
                connection.query(
                    `select
                    id
                    from addLiquidityRequests
                    where status0 != 255 or status1 != 255
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
        //});
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
            chainData.TangleRelayerContract = "0x3453912A250d7dC346784dAA335915A33C1af6CB";
            chainData.TangleRelayer = "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5";
            break;
        case "0x000000000000000000000000000000000000000000000000000000000000000f":
            chainData.whichProtocol = 0;
            chainData.rpcUrl = "localhost/";
            chainData.port = "8001";
            chainData.TangleRelayerContract = "0x0271908aF8dB4339b5a8343Ef20fae50F8B74Ccf";
            chainData.TangleRelayer = "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5";
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
    //indexOfMinRatio = 1; // manual override for testing
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
    console.log(`Response object sent to addLiquidityRequest with id ${requestObject.id} and paymentAmount ${requestObject.responseObject.paymentAmount}`);
    await new Promise((resolve, reject) => {
        connection.query(
            `update addLiquidityRequests set
            msgSender = "${requestObject.msgSender}",
            paymentAmount = "${"0x" + requestObject.responseObject.paymentAmount.substr(2).padStart(64, '0')}",
            paymentChain = "${requestObject.data.chains[indexOfMinRatio]}",
            gas0 = "${"0x" + gases[0].substr(2).padStart(64, '0')}",
            gasPrice0 = "${"0x" + gasPrices[0].substr(2).padStart(64, '0')}",
            gas1 = "${"0x" + gases[1].substr(2).padStart(64, '0')}",
            gasPrice1 = "${"0x" + gasPrices[1].substr(2).padStart(64, '0')}",
            chain0 = "${requestObject.data.chains[0]}",
            chain1 = "${requestObject.data.chains[1]}",
            token0 = "${requestObject.data.tokens[0]}",
            token1 = "${requestObject.data.tokens[1]}",
            amount0 = "${"0x" + requestObject.data.amounts[0].substr(2).padStart(64, '0')}",
            amount1 = "${"0x" + requestObject.data.amounts[1].substr(2).padStart(64, '0')}",
            timestamp = ${Date.now()}
            where id = ${requestObject.id}`,
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
processes.init( // processLog
    "processLog",
    async function (queueObject) {
        let next = () => {
            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        let { log, network, chainData, connection } = queueObject;
        this.queue.shift();
        let [id, method, value] = log.data.substr(2).match(/.{64}/g).map(a => "0x" + a);
        if (parseInt(method) == 0) {
            connection.query(
                `select
                paidAmount, paymentAmount, gas0, gasPrice0, gas1, gasPrice1, chain0, chain1, token0, token1, msgSender, amount0, amount1
                from addLiquidityRequests
                where id = ${parseInt(id)} and paymentChain = "${network.chainId}" and status0 = 0 and status1 = 0`,
            (err, res, fields) => {
                if (err) {
                    next();
                    throw err;
                } else {
                    if (res.length) {
                        let { paidAmount, paymentAmount, gas0, gasPrice0, gas1, gasPrice1, chain0, chain1, token0, token1, msgSender, amount0, amount1 } = res[0];
                        if (BigInt(paidAmount) + BigInt(value) >= BigInt(paymentAmount)) {
                            connection.query(
                                `update addLiquidityRequests set
                                paidAmount = "` + "0x" + (BigInt(paidAmount) + BigInt(value)).toString(16).padStart(64, '0') + `",
                                status0 = 254,
                                status1 = 254
                                where id = ` + parseInt(id),
                            async (err, res, fields) => {
                                if (err) {
                                    next();
                                    throw err;
                                } else {
                                    console.log(`updated paidAmount for addLiquidityRequest with id ${parseInt(id)}, >= paymentAmount`);
                                    let chainData0 = getChainData(chain0);
                                    let xdexTransferFromTx0 = {
                                        from: chainData0.TangleRelayer,
                                        to: chainData0.TangleRelayerContract,
                                        gasLimit: gas0,
                                        gasPrice: gasPrice0,
                                        data:
                                            sig("transferFrom(address,address,address,uint256,uint256,uint256") +
                                            token0.substr(2) +
                                            msgSender.substr(2) +
                                            amount0.substr(2) +
                                            '0'.padStart(64, '0') +
                                            parseInt(id).toString().padStart(64, '0'),
                                        nonce: 0,
                                        chainId: parseInt(chain0.replace(/0+(?!x|$)/, ""))
                                    };
                                    let chainData1 = getChainData(chain1);
                                    let xdexTransferFromTx1 = {
                                        from: chainData1.TangleRelayer,
                                        to: chainData1.TangleRelayerContract,
                                        gasLimit: gas1,
                                        gasPrice: gasPrice1,
                                        data:
                                            sig("transferFrom(address,address,address,uint256,uint256,uint256") +
                                            token1.substr(2) +
                                            msgSender.substr(2) +
                                            amount1.substr(2) +
                                            '0'.padStart(64, '0') +
                                            parseInt(id).toString().padStart(64, '0'),
                                        nonce: 0,
                                        chainId: parseInt(chain1.replace(/0+(?!x|$)/, ""))
                                    };
                                    let signedTx0 = await xdexWallet.signTransaction(xdexTransferFromTx0);
                                    let signedTx1 = await xdexWallet.signTransaction(xdexTransferFromTx1);
                                    chainData0.method = "eth_sendRawTransaction";
                                    chainData0.params = [signedTx0];
                                    chainData1.method = "eth_sendRawTransaction";
                                    chainData1.params = [signedTx1];
                                    let rawTxResponse0 = await evmJsonRpcRequest(chainData0);
                                    let rawTxResponse1 = await evmJsonRpcRequest(chainData1);
                                    console.log([rawTxResponse0, rawTxResponse1]);
                                    next();
                                }
                            });
                        } else {
                            connection.query(
                                `update addLiquidityRequests set
                                paidAmount = "` + "0x" + (BigInt(paidAmount) + BigInt(value)).toString(16).padStart(64, '0') + `"
                                where id = ` + parseInt(id),
                            (err, res, fields) => {
                                if (err) {
                                    next();
                                    throw err;
                                } else {
                                    console.log(`updated paidAmount for addLiquidityRequest with id ${parseInt(id)}, but < paymentAmount`);
                                    next();
                                }
                            });
                        }
                    }
                    if (!res.length) {
                        console.log(`\x1b[33m${"WARNING: addLiquidityRequest payment log found with no matching id AND chain AND zero-statuses, ignoring log"}\x1b[0m`);
                        next();
                    }
                }
            });
        } else {
            next();
        }
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



    let networks = [
        {
            name: "P14",
            id: null,
            chainId: "0x000000000000000000000000000000000000000000000000000000000000000e"
        },
        {
            name: "P15",
            id: null,
            chainId: "0x000000000000000000000000000000000000000000000000000000000000000f"
        }
    ];
    let totalPollingPeriod = 2 * 1000;
    networks.forEach(async (network, i) => {
        let chainData = await getChainData(network.chainId);
        chainData.method = "eth_newFilter";
        chainData.params = [{
            fromBlock: "0x0",
            toBlock: "latest",
            address: chainData.TangleRelayerContract,
            topics: [sigLong("PaymentReceived(uint256,uint256,uint256)")]
        }]
        network.id = (await evmJsonRpcRequest(chainData)).result;
        chainData.method = "eth_getFilterLogs";
        chainData.params = [network.id];
        let processLog = async log => {
            let [id, method, value] = log.data.substr(2).match(/.{64}/g).map(a => "0x" + a);
            if (parseInt(method) == 0) {
                connection.query(
                    `select
                    paidAmount, paymentAmount
                    from addLiquidityRequests
                    where id = ${parseInt(id)} and paymentChain = "${network.chainId}" and status0 = 0 and status1 = 0`,
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
                                        >= paymentAmount ${BigInt(paymentAmount)}? ${BigInt(paidAmount) + BigInt(value) >= BigInt(paymentAmount)}`.replace(/^\s+/gm, "")
                                    );
                                    if (BigInt(paidAmount) + BigInt(value) >= BigInt(paymentAmount)) {
                                        console.log(parseInt(id), processingTransactions.addLiquidity.indexOf(parseInt(id)));
                                    }
                                }
                            });
                        }
                        if (!res.length) {
                            console.log(`\x1b[33m${"WARNING: addLiquidityRequest payment log found with no matching id AND chain AND zero-statuses, ignoring log"}\x1b[0m`);
                        }
                    }
                });
            }
        };
        setTimeout(() => {
            setInterval(async () => {
                console.log(`Checking logs of network ${network.name}...`);
                let logs = (await evmJsonRpcRequest(chainData)).result;
                if (logs && logs.forEach) logs.forEach(log => {
                    processes["processLog"].queue.push({
                        log: log,
                        network: network,
                        chainData: chainData,
                        connection: connection
                    });
                });
                if (chainData.method != "eth_getFilterChanges") chainData.method = "eth_getFilterChanges";
            }, totalPollingPeriod);
        }, parseInt(i * totalPollingPeriod / networks.length));
    });



})();
