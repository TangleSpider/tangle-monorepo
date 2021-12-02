let path = require("path");
let keccak256 = require("@ethersproject/keccak256").keccak256;
let auditAddress = "0x2f6ede25f37a9ec0c1cf2f26c98369261f21c39f";
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
    let jsonPath = path.join(__dirname, "logs.txt");
    let logs = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let balances = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        if (blockNumber >= atBlock) return;
        if (topics[0] == transfer) {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data);
            if (
                sender == longAddress("0xAf1843657F00F8C048139B7103784fdeFC403702") ||
                receiver == longAddress("0xAf1843657F00F8C048139B7103784fdeFC403702")
            ) return;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            balances[receiver] += amount;
            /*if (sender == longAddress(auditAddress))
                console.log("sell", amount, log.transactionHash, balances[longAddress(auditAddress)]);
            if (receiver == longAddress(auditAddress))
                console.log("buy", amount, log.transactionHash, balances[longAddress(auditAddress)]);*/
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    balances = Object.fromEntries(balances);
    return balances;
};

module.exports = exports = getBalancesAtBlock;

/*let balances = getBalancesAtBlock(18195967);
console.log(balances);

console.log(Object.values(balances).filter(b => b > 0).reduce((p, c) => { return p + c; }));*/
//let balances = getReservesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
