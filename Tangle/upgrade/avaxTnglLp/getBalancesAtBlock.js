let keccak256 = require("@ethersproject/keccak256").keccak256;
let sig = (selector, short = false) => {
    return keccak256(
        "0x" +
        selector.split('').map(c => {
            return c.charCodeAt(0).toString(16);
        }).join('')
    ).substr(0, short ? 10 : undefined);
};

let transfer = sig("Transfer(address,address,uint256)");

let fs = require("fs");
let longAddress = address => {
    return "0x" + address.toLowerCase().substr(2).padStart(64, '0');
};
let getBalancesAtBlock = atBlock => {
    let logs = JSON.parse(fs.readFileSync("./logs.txt", "utf8"));
    let balances = {};
    let totalLpSupply = 0n;
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        //if (blockNumber >= atBlock) return;
        if (topics[0] == transfer) {
            //console.log(log);
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            /*if (
                receiver == longAddress("0x2f96f61a027b5101e966ec1ba75b78f353259fb3".toLowerCase()) ||
                sender == longAddress("0x2f96f61a027b5101e966ec1ba75b78f353259fb3".toLowerCase())
            ) {
                return;
            }*/
            let amount = BigInt(data);
            if (sender == longAddress("0x".padEnd(42, '0'))) {
                totalLpSupply += amount;
            }
            if (receiver == longAddress("0x".padEnd(42, '0'))) {
                totalLpSupply -= amount;
            }
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            balances[receiver] += amount;
            //if (balances[longAddress("0xD17584633bc8D190E5A14502976daD9640456D6d")])
                console.log(
                    `${BigInt(log.blockNumber).toString()}`,
                    BigInt(Object.entries(balances).reduce((p, c) => { return c[1] > 0 ? p + c[1] : p; }, 0n)).toString()
                );
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    balances = Object.fromEntries(balances);
    return balances;
};

module.exports = exports = getBalancesAtBlock;

console.log(getBalancesAtBlock()["0xD17584633bc8D190E5A14502976daD9640456D6d".toLowerCase()]);

/*let balances = getBalancesAtBlock(18195967);
console.log(balances);

console.log(Object.values(balances).filter(b => b > 0).reduce((p, c) => { return p + c; }));*/
//let balances = getReservesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
