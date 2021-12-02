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

let profitMargin = 5;

let hexZeroes = bytes => {
    return "0x" + "".padStart(bytes * 2, '0')
};
let toPaddedHexString = (num, bytes) => {
    return "0x" + (num).toString(16).padStart(bytes * 2, '0')
};
let rootNth = (val, k=2n) => {
    let o = 0n; // old approx value
    let x = val;
    let limit = 100;

    while(x**k!==k && x!==o && --limit) {
      o=x;
      x = ((k-1n)*x + val/x**(k-1n))/k;
    }

    return x;
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
            realAmount0 char(66) default "${hexZeroes(32)}",
            amount1 char(66) default "${hexZeroes(32)}",
            realAmount1 char(66) default "${hexZeroes(32)}",
            timestamp bigint default 0`,
        reset: true
    },
    {
        name: "nonces",
        createDefinition:
            `chainId char(66),
            nonce char(66) default "${hexZeroes(32)}"`,
        reset: false
    },
    {
        name: "blockNumbers",
        createDefinition:
            `chainId char(66),
            blockNumber char(66) default "${hexZeroes(32)}",
            logType tinyint unsigned`,
        reset: false
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
            where status0 = 255 and status1 = 255
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
let getChainData = chain => { // TODO: discard this function in favor of the below chains object
    let chainData = {};
    switch (chain) {
        case "[REDACTED]0e":
            chainData.whichProtocol = 0;
            chainData.rpcUrl = "localhost/";
            chainData.port = "8000";
            chainData.TangleRelayerContract = "0xA509CA4CF5E05B1e2178B1a9Ade08e05374C64af";
            chainData.TangleRelayer = "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5";
            chainData.chainId = "[REDACTED]0e";
            chainData.name = "P14";
            break;
        case "[REDACTED]0f":
            chainData.whichProtocol = 0;
            chainData.rpcUrl = "localhost/";
            chainData.port = "8001";
            chainData.TangleRelayerContract = "0x3835Eb64fe65B7a3d85d110152ecaF547A919ca3";
            chainData.TangleRelayer = "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5";
            chainData.chainId = "[REDACTED]0f";
            chainData.name = "P15";
            break;
    }
    return chainData;
};
let chains = {
    P14: {
        name: "P14",
        shortId: "0x" + "e",
        longId: "0x" + "e".padStart(64, '0'),
        rpcUrl: "localhost/",
        whichProtocol: 0, // TODO: change value to "http" or "https" and key to rpcProtocol
        port: "8000", // TODO: figure out why above has port as a string and not a number and change key to rpcPort
        TangleRelayerContract: "0xA509CA4CF5E05B1e2178B1a9Ade08e05374C64af",
        TangleRelayer: "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5",
        logPolls: [
            {
                topic: sigLong("PaymentReceived(uint256,uint256,uint256)"),
                fromBlockNumber: 0
            },
            {
                topic: sigLong("TokensTransferred(uint256,uint256,uint256)"),
                fromBlockNumber: 0
            }
        ],
        filterId: null
    },
    P15: {
        name: "P15",
        shortId: "0x" + "f",
        longId: "0x" + "f".padStart(64, '0'),
        rpcUrl: "localhost/",
        whichProtocol: 0, // TODO: change to "http" or "https" and key to rpcProtocol
        port: "8001", // TODO: figure out why above has port as a string and not a number and change key to rpcPort
        TangleRelayerContract: "0x3835Eb64fe65B7a3d85d110152ecaF547A919ca3",
        TangleRelayer: "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5",
        logPolls: [
            {
                topic: sigLong("PaymentReceived(uint256,uint256,uint256)"),
                fromBlockNumber: 0
            },
            {
                topic: sigLong("TokensTransferred(uint256,uint256,uint256)"),
                fromBlockNumber: 0
            }
        ],
        filterId: null
    }
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
                '0'.padStart(64, '0') +
                requestObject.id.toString(16).padStart(64, '0')
        }];
        //console.log(evmJsonRpcRequestParameters.params[0]);
        //console.log(await evmJsonRpcRequest(evmJsonRpcRequestParameters));
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
/*let getPaymentDetails = requestObject => {
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
};*/
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
        let { log, network, chainData, connection, blockNumberPaymentLog, blockNumberTransferFromLog } = queueObject;
        //console.log(`${network.name} blockNumberPaymentLog ${blockNumberPaymentLog}, blockNumberTransferFromLog ${blockNumberTransferFromLog}`);
        this.queue.shift();
        //console.log(log);
        //console.log(network.shortId);
        if (log.topics[0] == sigLong("PaymentReceived(uint256,uint256,uint256)")) {
            //console.log(network.name, "pay", log.blockNumber, blockNumberPaymentLog);
            if (parseInt(log.blockNumber) > parseInt(blockNumberPaymentLog)) {
                //console.log(`${network.shortId}-0 from ${blockNumberTransferFromLog} to ${log.blockNumber}`);
                /*console.log(
                    `update blockNumbers set
                    blockNumber = "${"0x" + log.blockNumber.substr(2).padStart(64, '0')}"
                    where chainId = "${network.longId}" and logType = 0`
                );*/
                await new Promise((resolve, reject) => {
                    connection.query(
                        `update blockNumbers set
                        blockNumber = "${"0x" + log.blockNumber.substr(2).padStart(64, '0')}"
                        where chainId = "${network.longId}" and logType = 0`,
                    (err, res) => {
                        if (err) throw err;
                        if (!err) resolve(null);
                    });
                });
            }
            let [id, method, value] = log.data.substr(2).match(/.{64}/g).map(a => "0x" + a);
            if (parseInt(method) == 0) {
                connection.query(
                    `select
                    paidAmount, paymentAmount, gas0, gasPrice0, gas1, gasPrice1, chain0, chain1, token0, token1, msgSender, amount0, amount1
                    from addLiquidityRequests
                    where id = ${parseInt(id)} and paymentChain = "${network.longId}" and status0 = 0 and status1 = 0`,
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
                                        let nonce0 = parseInt(await new Promise((resolve, reject) => {
                                            connection.query(
                                                `select
                                                nonce
                                                from nonces
                                                where chainId = "${chain0}"`,
                                            (err, res) => {
                                                if (err) throw err;
                                                if (!err && res.length) resolve(res[0].nonce);
                                                if (!err && !res.length) {
                                                    connection.query(
                                                        `insert
                                                        nonces
                                                        (nonce, chainId)
                                                        values (default, "${chain0}")`,
                                                    (err, res) => {
                                                        if (err) throw err;
                                                        if (res) resolve(0);
                                                    });
                                                }
                                            });
                                        }));
                                        let nonce1 = parseInt(await new Promise((resolve, reject) => {
                                            connection.query(
                                                `select
                                                nonce
                                                from nonces
                                                where chainId = "${chain1}"`,
                                            (err, res) => {
                                                if (err) throw err;
                                                if (!err && res.length) resolve(res[0].nonce);
                                                if (!err && !res.length) {
                                                    connection.query(
                                                        `insert
                                                        nonces
                                                        (nonce, chainId)
                                                        values (default, "${chain1}")`,
                                                    (err, res) => {
                                                        if (err) throw err;
                                                        if (res) resolve(0);
                                                    });
                                                }
                                            });
                                        }));
                                        let chainData0 = getChainData(chain0);
                                        let chainData1 = getChainData(chain1);
                                        let xdexTransferFromTxs = [[{
                                            from: chainData0.TangleRelayer,
                                            to: chainData0.TangleRelayerContract,
                                            gasLimit: gas0,
                                            gasPrice: gasPrice0,
                                            data:
                                                sig("transferFrom(address,address,address,uint256,uint256,uint256)") +
                                                token0.substr(2).padStart(64, '0') +
                                                msgSender.substr(2).padStart(64, '0') +
                                                chainData0.TangleRelayerContract.substr(2).padStart(64, '0') +
                                                amount0.substr(2).padStart(64, '0') +
                                                '0'.padStart(64, '0') +
                                                parseInt(id).toString().padStart(64, '0'),
                                            nonce: nonce0,
                                            chainId: parseInt(chain0.replace(/0+(?!x|$)/, ""))
                                        }, chainData0],
                                        [{
                                            from: chainData1.TangleRelayer,
                                            to: chainData1.TangleRelayerContract,
                                            gasLimit: gas1,
                                            gasPrice: gasPrice1,
                                            data:
                                                sig("transferFrom(address,address,address,uint256,uint256,uint256)") +
                                                token1.substr(2).padStart(64, '0') +
                                                msgSender.substr(2).padStart(64, '0') +
                                                chainData1.TangleRelayerContract.substr(2).padStart(64, '0') +
                                                amount1.substr(2).padStart(64, '0') +
                                                '0'.padStart(64, '0') +
                                                parseInt(id).toString().padStart(64, '0'),
                                            nonce: nonce1,
                                            chainId: parseInt(chain1.replace(/0+(?!x|$)/, ""))
                                        }, chainData1]];
                                        //console.log(xdexTransferFromTxs[0], xdexTransferFromTxs[1]);
                                        let txResponses = await Promise.all(xdexTransferFromTxs.map(xdexTransferFromTx => {
                                            return new Promise(async (resolve, reject) => {
                                                let signedTx = await xdexWallet.signTransaction(xdexTransferFromTx[0]);
                                                xdexTransferFromTx[1].method = "eth_sendRawTransaction";
                                                xdexTransferFromTx[1].params = [signedTx];
                                                let rawTxResponse = await evmJsonRpcRequest(xdexTransferFromTx[1]);
                                                while (rawTxResponse.error && rawTxResponse.error.message == "nonce too low") {
                                                    xdexTransferFromTx[0].nonce++;
                                                    signedTx = await xdexWallet.signTransaction(xdexTransferFromTx[0]);
                                                    xdexTransferFromTx[1].params = [signedTx];
                                                    rawTxResponse = await evmJsonRpcRequest(xdexTransferFromTx[1]);
                                                }
                                                xdexTransferFromTx[0].nonce++;
                                                connection.query(
                                                    `update nonces set
                                                    nonce = "${"0x" + xdexTransferFromTx[0].nonce.toString(16).padStart(64, '0')}"
                                                    where chainId = "${xdexTransferFromTx[1].chainId}"`,
                                                (err, res) => {
                                                    if (err) throw err;
                                                    if (!err) resolve(rawTxResponse)
                                                });
                                            });
                                        }));
                                        //console.log(txResponses);
                                        console.log(`transferFrom tx's for id ${parseInt(id)} sent, hash0: ${txResponses[0].result}, hash1: ${txResponses[1].result}`);
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
        } else {
            //console.log(network.name, "transfer", log.blockNumber, blockNumberTransferFromLog);
            if (parseInt(log.blockNumber) > parseInt(blockNumberTransferFromLog)) {
                /*console.log(
                    `update blockNumbers set
                    blockNumber = "${"0x" + log.blockNumber.substr(2).padStart(64, '0')}"
                    where chainId = "${network.longId}" and logType = 1`
                );*/
                //console.log(`${network.shortId}-1 from ${blockNumberTransferFromLog} to ${log.blockNumber}`);
                await new Promise((resolve, reject) => {
                    connection.query(
                        `update blockNumbers set
                        blockNumber = "${"0x" + log.blockNumber.substr(2).padStart(64, '0')}"
                        where chainId = "${network.longId}" and logType = 1`,
                    (err, res) => {
                        if (err) throw err;
                        if (!err) resolve(null);
                    });
                });
            }
            let [amount, id, method] = log.data.substr(2).match(/.{64}/g).map(a => "0x" + a);
            if (parseInt(method) == 0) {
                connection.query(
                    `select
                    paidAmount, paymentAmount, gas0, gasPrice0, gas1, gasPrice1, chain0, chain1, token0, token1, msgSender, amount0, amount1, status0, status1, id, realAmount0, realAmount1
                    from addLiquidityRequests
                    where id = ${parseInt(id)} and ((chain0 = "${network.longId}" and status0 = 254) or (chain1 = "${network.longId}" and status1 = 254))`,
                (err, res, fields) => {
                    if (err) {
                        next();
                        throw err;
                    } else {
                        if (res.length) {
                            //console.log(res);
                            let { paidAmount, paymentAmount, gas0, gasPrice0, gas1, gasPrice1, chain0, chain1, token0, token1, msgSender, amount0, amount1, status0, status1, realAmount0, realAmount1 } = res[0];
                            let index = network.longId == chain0 ? 0 : 1;
                            connection.query(
                                `update addLiquidityRequests set
                                status${index} = 255, realAmount${index} = "${amount}"
                                where id = ${parseInt(id)}`,
                            async (err, res) => {
                                if (err) {
                                    next();
                                    throw err;
                                } else {
                                    if ([status0, status1][+!index] == 255) {
                                        let realAmounts = [realAmount0, realAmount1];
                                        realAmounts[index] = amount;
                                        console.log(`transferFrom with hash ${log.transactionHash} successful, updated status${index} to 255 (finished), both transferFroms successful, adding liquidity...`);
                                        console.log("real amounts :", realAmounts);
                                        let amounts = await new Promise((resolve, reject) => { // this is a copy of the previous estimate amounts function, cleanup later into one function
                                            let pair = keccak256(chain0 + token0.substr(2) + chain0.substr(2) + token0.substr(2));
                                            connection.query("select reserve0, reserve1 from pairs where pair = " + pair, (err, res, fields) => {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    // there is not an if res.length branch here, fix that
                                                    console.log(res);
                                                    if (!res.length) {
                                                        resolve([realAmounts[0], realAmounts[1]]);
                                                    } else {
                                                        let [reserve0, reserve1] = [res[0].reserve0, res[1].reserve1];
                                                        let amount1Optimal = BigInt(realAmounts[0]) * BigInt(reserve1) / BigInt(reserve0);
                                                        if (amount1Optimal <= amountsDesired[1]) {
                                                            resolve([realAmounts[0], amount1Optimal]);
                                                        } else {
                                                            let amount0Optimal = BigInt(realAmounts[1]) * BigInt(reserve0) / BigInt(reserve1);
                                                            resolve([amount0Optimal, realAmounts[1]]);
                                                        }
                                                    }
                                                }
                                            });
                                        });
                                        console.log("real amounts to add to liquidity:", amounts);
                                        let MINIMUM_LIQUIDITY = 1e3;
                                        let liquidity = "0x" + (rootNth(BigInt(amounts[0]) * BigInt(amounts[1])) - BigInt(MINIMUM_LIQUIDITY)).toString(16).padStart(64, '0');
                                        console.log(`minted liquidity to ${msgSender}`, liquidity);
                                        console.log("minted liquidity to zero address (permanently lock the first MINIMUM_LIQUIDITY tokens)", "0x" + BigInt(MINIMUM_LIQUIDITY).toString(16).padStart(64, '0'));
                                        next();
                                    } else {
                                        console.log(`transferFrom with hash ${log.transactionHash} successful, updated status${index} to 255 (finished), waiting on status${+!index}`);
                                        next();
                                    }
                                }
                            });
                            next();
                        }
                        if (!res.length) {
                            console.log(`\x1b[33m${"WARNING: transferFrom log found with no matching id AND chain AND 254-statuses, ignoring log"}\x1b[0m`);
                            next();
                        }
                    }
                });
            } else {
                next();
            }
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



    let pollingPeriod = 2 * 1000;
    Object.values(chains).forEach(async (chain, i) => {
        for (let j = 0; j < chain.logPolls.length; j++) {
            chain.logPolls[j].fromBlockNumber = (await new Promise((resolve, reject) => {
                connection.query(
                    `select
                    blockNumber
                    from blockNumbers
                    where chainId = "${chain.longId}" and logType = ${j}`,
                (err, res) => {
                    if (err) throw err;
                    if (!err && res.length) resolve(res[0].blockNumber);
                    if (!err && !res.length) {
                        connection.query(
                            `insert
                            blockNumbers
                            (blockNumber, chainId, logType)
                            values (default, "${chain.longId}", ${j})`,
                        (err, res) => {
                            if (err) throw err;
                            resolve(hexZeroes(64));
                        });
                    }
                });
            })).replace(/0+(?!x|$)/, "");
        }
        let payload = { ...chain };
        payload.method = "eth_newFilter";
        payload.params = [{
            fromBlock: chain.logPolls.reduce((p, c) => { return c.fromBlockNumber < p.fromBlockNumber ? c : p; }).fromBlockNumber,
            toBlock: "latest",
            address: chain.TangleRelayerContract,
            topics: [chain.logPolls.map(logPoll => logPoll.topic)]
        }];
        chain.filterId = (await evmJsonRpcRequest(payload)).result;
        payload.method = "eth_getFilterLogs";
        payload.params = [chain.filterId];
        setTimeout(() => {
            setInterval(async () => {
                let logs = (await evmJsonRpcRequest(payload)).result;
                if (logs && logs.forEach) logs.forEach(log => {
                    processes["processLog"].queue.push({
                        log: log,
                        network: chain, // TODO: fix this line and below, wasteful code
                        chainData: payload, // TODO: fix this line and above, wasteful code
                        connection: connection,
                        blockNumberPaymentLog: chain.logPolls[0].fromBlockNumber, // TODO: fix this line and above, wasteful code
                        blockNumberTransferFromLog: chain.logPolls[1].fromBlockNumber // TODO: fix this line and above, wasteful code
                    });
                });
                if (payload.method != "eth_getFilterChanges") payload.method = "eth_getFilterChanges";
            }, pollingPeriod);
        }, parseInt(i * pollingPeriod / Object.keys(chains).length));
    });



})();
