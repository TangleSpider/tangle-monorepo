let fs = require("fs");
let path = require("path");
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
let logRebase = sig("LogRebase(uint256,uint256)");
let longAddress = address => {
    return "0x" + address.toLowerCase().substr(2).padStart(64, '0');
};
let fmtAmtDec = (amount, decimals) => {
    amount = amount.toString();
    amount = amount.replace(new RegExp(`(?=\\d{${decimals}})(?!\\d{${decimals + 1},})`), '.');
    amount = amount.replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return amount.padStart(24, ' ');
};

let address = "0xe1a811bdfb656dc47a7262dbde31071d9a916b1a";

let getBalancesAtBlock = atBlock => {
    let jsonPath = path.join(__dirname, "logs.txt");
    let logs = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let initTokens = 10n ** 17n
    let uintMax = 2n ** 256n - 1n;
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerUnit = initPieces / initTokens;
    let totalSupply = initTokens;
    let balances = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber, logIndex } = log;
        if (blockNumber >= atBlock) return
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            if (
                receiver == longAddress("0xa810ad36e545e3db009cc8ca53930f3d76a7e8e9") ||
                receiver == longAddress("0x5b92de3a82739fd4762c15da31de72ef18453dbe") ||
                sender == longAddress("0xa810ad36e545e3db009cc8ca53930f3d76a7e8e9") ||
                sender == longAddress("0x5b92de3a82739fd4762c15da31de72ef18453dbe")
            ) {
                //console.log("test");
                return;
            }
            let amount = BigInt(data) * piecesPerUnit;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            balances[receiver] += amount;
            /*if (
                (sender.match(address.substr(2)) || receiver.match(address.substr(2))) &&
                balances[longAddress(address)]
            )
                console.log(balances[longAddress(address)] / piecesPerUnit);*/
        };
        let handleReflect = () => {
            totalSupply = BigInt(data);
            piecesPerUnit = initPieces / totalSupply;
        };
        switch (topics[0]) {
            case transfer:
                handleTransfer();
                break;
            case logRebase:
                handleReflect();
                break;
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1] / piecesPerUnit]
    );
    balances = Object.fromEntries(balances);
    return balances;
};

module.exports = exports = getBalancesAtBlock;

//console.log(getBalancesAtBlock(18195967)["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
//let balances = getBalancesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
