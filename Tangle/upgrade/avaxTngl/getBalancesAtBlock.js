let fs = require("fs");
let path = require("path");
let longAddress = address => {
    return "0x" + address.toLowerCase().substr(2).padStart(64, '0');
};
let fmtAmtDec = (amount, decimals) => {
    amount = amount.toString();
    amount = amount.replace(new RegExp(`(?=\\d{${decimals}})(?!\\d{${decimals + 1},})`), '.');
    amount = amount.replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return amount.padStart(24, ' ');
};
let getBalancesAtBlock = atBlock => {
    let jsonPath = path.join(__dirname, "logs.txt");
    let logs = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let initTokens = 10n ** 18n
    let uintMax = 2n ** 256n - 1n;
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerUnit = initPieces / initTokens;
    let totalSupply = initTokens;
    let balances = {};
    let reflect = "[REDACTED]93";
    let transfer = "[REDACTED]ef";
    let logIndex;
    logs.forEach((log, i) => {
        let { topics, data, blockNumber, logIndex } = log;
        //if (blockNumber >= atBlock) return;
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data) * piecesPerUnit;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            balances[receiver] += amount;
        };
        let handleReflect = () => {
            let reflectAmount = BigInt("0x" + data.substr(66)) * piecesPerUnit;
            let reflectFrom = "0x" + data.substr(2, 64).toLowerCase();
            balances[reflectFrom] -= reflectAmount;
            let liquidityAddress = "0xa02f0Bf793ff232fE0A7511C900494E99F0F674d";
            let tip = totalSupply * piecesPerUnit - balances[longAddress(liquidityAddress)] - balances[longAddress("0x9De2b19dEaDBeeFB821D00c39289919DD5313566")];
            let tup = tip - reflectAmount;
            piecesPerUnit = piecesPerUnit * tup / tip;
            if (balances[longAddress(liquidityAddress)])
                balances[longAddress(liquidityAddress)] = balances[longAddress(liquidityAddress)] * tup / tip;
            if (balances[longAddress("0x9De2b19dEaDBeeFB821D00c39289919DD5313566")])
                balances[longAddress("0x9De2b19dEaDBeeFB821D00c39289919DD5313566")] = balances[longAddress("0x9De2b19dEaDBeeFB821D00c39289919DD5313566")] * tup / tip;
            console.log(`${BigInt(log.blockNumber).toString()}`, BigInt(balances[longAddress("0xD17584633bc8D190E5A14502976daD9640456D6d")] / piecesPerUnit).toString());
        };
        switch (topics[0]) {
            case transfer:
                handleTransfer();
                break;
            case reflect:
                handleReflect();
                break;
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1] / piecesPerUnit]
    );
    balances = Object.fromEntries(balances);

    //console.log(balances["0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f".toLowerCase()]);

    return balances;
};

module.exports = exports = getBalancesAtBlock;


console.log(getBalancesAtBlock()["0xD17584633bc8D190E5A14502976daD9640456D6d".toLowerCase()]);


//console.log(getBalancesAtBlock(18195967)["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
//let balances = getBalancesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
