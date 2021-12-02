let keccak256 = require("@ethersproject/keccak256").keccak256;
let sig = (selector, short = false) => {
    return keccak256(
        "0x" +
        selector.split('').map(c => {
            return c.charCodeAt(0).toString(16);
        }).join('')
    ).substr(0, short ? 10 : undefined);
};

let sync = sig("Sync(uint112,uint112)");

let fs = require("fs");
let longAddress = address => {
    return "0x" + address.toLowerCase().substr(2).padStart(64, '0');
};
let getReservesAtBlock = atBlock => {
    let logs = JSON.parse(fs.readFileSync("./logs.txt", "utf8"));
    let balances = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        if (blockNumber >= atBlock) return;
        if (topics[0] == sync) {
            let reserves = data.substr(2).match(/.{64}/g).map(n => BigInt("0x" + n));
            console.log(parseInt(reserves[0]) / parseInt(reserves[1]) / 1e9 * 1.47);
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    balances = Object.fromEntries(balances);
    return balances;
};

module.exports = exports = getReservesAtBlock;

console.log(getReservesAtBlock(18195967));
/*let balances = getBalancesAtBlock(18195967);
console.log(balances);

console.log(Object.values(balances).filter(b => b > 0).reduce((p, c) => { return p + c; }));*/
//let balances = getReservesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
