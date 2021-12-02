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
let rebaseEvent = sig("RebaseEvent(int256)");
let longAddress = address => {
    return "0x" + address.toLowerCase().substr(2).padStart(64, '0');
};
let fmtAmtDec = (amount, decimals) => {
    amount = amount.toString();
    amount = amount.replace(new RegExp(`(?=\\d{${decimals}})(?!\\d{${decimals + 1},})`), '.');
    amount = amount.replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return amount.padStart(24, ' ');
};

let address = "0x4Ee7d53f08cf49D5fBFe6Bc14fad87D3DB63a242";

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
                receiver == longAddress("0xBb586dda90CbfE82f486e98372ECb558f9a5a4b9".toLowerCase()) ||
                receiver == longAddress("0x18d0D5ab631A8bE9343d8b650335BBA50553AdaD".toLowerCase()) ||
                receiver == longAddress("0x6cbe9e9e7a4fbbb0aafb065dae308633c19d1c6d".toLowerCase()) ||
                receiver == longAddress("0xe45b918fe144695539a7ef97d3077943354152de".toLowerCase()) ||
                receiver == longAddress("0xf8fbf0b2ccdf612189987b5479624433a205a929".toLowerCase()) ||
                receiver == longAddress("0x5c027183304b71a409f80b308b69ad0c7218759f".toLowerCase()) ||
                sender == longAddress("0xBb586dda90CbfE82f486e98372ECb558f9a5a4b9".toLowerCase()) ||
                sender == longAddress("0x18d0D5ab631A8bE9343d8b650335BBA50553AdaD".toLowerCase()) ||
                sender == longAddress("0x6cbe9e9e7a4fbbb0aafb065dae308633c19d1c6d".toLowerCase()) ||
                sender == longAddress("0xe45b918fe144695539a7ef97d3077943354152de".toLowerCase()) ||
                sender == longAddress("0xf8fbf0b2ccdf612189987b5479624433a205a929".toLowerCase()) ||
                sender == longAddress("0x5c027183304b71a409f80b308b69ad0c7218759f".toLowerCase())
            ) {
                return;
            }
            let amount = BigInt(data) * piecesPerUnit;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            balances[receiver] += amount;
            if (
                sender == longAddress(address) ||
                receiver == longAddress(address)
            ) console.log(
                BigInt(blockNumber).toString(),
                balances[longAddress(address)] / piecesPerUnit
            );
        };
        let handleReflect = () => {
            data = BigInt(data);
            if (data >= 1n << 128n) data = -((1n << 256n) - data);
            totalSupply += data;
            piecesPerUnit = initPieces / totalSupply;
        };
        switch (topics[0]) {
            case transfer:
                handleTransfer();
                break;
            case rebaseEvent:
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
