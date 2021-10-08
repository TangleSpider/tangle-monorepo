const { Worker, isMainThread,  workerData, parentPort } = require('worker_threads');
let { keccak256 } = require("@ethersproject/keccak256");

let start = Date.now();
let hashes = 0;
let workers = 3;

if (isMainThread) {
	for (let i = 0; i < workers; i++) {
        let w = new Worker(__filename, { workerData: i });
        w.on("message", msg => {
            console.log(msg);
            hashes += 100000;
        });
    }
    setInterval(async () => { console.log(hashes / (Date.now() - start) * 1000) }, 1000);
} else {
    let counters = [0, 0, 0]
    let hash = workerData;
    while (true) {
        if (counters[workerData] % 100000 == 0) parentPort.postMessage({ id: workerData, counters: counters, lastHash: hash });
        hash = keccak256(counters[workerData]);
        counters[workerData] += workers;
    }
}
