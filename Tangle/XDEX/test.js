require("dotenv").config();
let connection = require("./js/getMysqlConnection.js");
let getEnv = require("./js/getEnv.js");
let evmJsonRpcRequest = require("./js/evmJsonRpcRequest.js");
require("./js/initializeLiquidityAddTable.js")(connection);

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

initProcess(
    "liquidityAddRequest",
    async function (queueObject) {
        let next = () => {

            // things to do when process is finished

            if (this.queue.length) this.process(this.queue[0]);
            if (!this.queue.length) this.running = false;
        };
        this.queue.shift();

        // things to do during processing
        let id = await getPendingLiquidityAddId();
        console.log(id);
        //let g0 = await estimateGas(T.transferFrom(P, C, A, M)
        //console.log(g0);

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

console.log(getEnv("BSC_RPC_URL"));

/*(async () => {
    for (let i = 0; i < 10; i++) {
        (async () => {
            processes["liquidityAddRequest"].queue.push({});
        })();
    }
})();*/
