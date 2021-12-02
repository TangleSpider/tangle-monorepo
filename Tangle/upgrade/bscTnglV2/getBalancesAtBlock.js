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
    let reflect = "[REDACTED]a7";
    let transfer = "[REDACTED]ef";
    balances["[REDACTED]1a"] = initPieces;
    let logIndex;
    let points = {
        "marketMaking": {},
        "airdropping": {}
    };
    logs.forEach((log, i) => {
        let { topics, data, blockNumber, logIndex } = log;
        if (blockNumber >= atBlock) return;
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data) * piecesPerUnit;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            if (receiver == longAddress("0x7d4f4b77d3002ae7079d8ca6304d208512e92ca4") && amount / piecesPerUnit >= 1000000000) {
                if (!points["marketMaking"][sender]) points["marketMaking"][sender] = 0n;
                points["marketMaking"][sender] += 1n;
            }
            if (amount / piecesPerUnit == 1000000000) {
                if (!points["airdropping"][sender]) points["airdropping"][sender] = 0n;
                points["airdropping"][sender] += 1n;
            }
            balances[sender] -= amount;
            balances[receiver] += amount;
            /*if (sender == longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f"))
                console.log("sell", amount / piecesPerUnit, log.transactionHash, balances[longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f")] / piecesPerUnit);
            if (receiver == longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f"))
                console.log("buy", amount / piecesPerUnit, log.transactionHash, balances[longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f")] / piecesPerUnit);
        */
        let reflectAmount = amount * 100n / 95n / 100n;
        /*if (reflectFrom == longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f"))
            console.log("reflect", reflectAmount / piecesPerUnit, log.transactionHash, balances[longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f")] / piecesPerUnit);
        */let liquidityAddress = "0x7d4f4b77d3002ae7079d8ca6304d208512e92ca4";
        let tip = totalSupply * piecesPerUnit - balances[longAddress(liquidityAddress)];
        let tup = tip - reflectAmount;
        piecesPerUnit = piecesPerUnit * tup / tip;
        if (balances[longAddress(liquidityAddress)])
            balances[longAddress(liquidityAddress)] = balances[longAddress(liquidityAddress)] * tup / tip;
        /*if (sender == longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f"))
            console.log("sell", amount / piecesPerUnit, log.transactionHash, balances[longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f")] / piecesPerUnit);
        if (receiver == longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f"))
            console.log("buy", amount / piecesPerUnit, log.transactionHash, balances[longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f")] / piecesPerUnit);
    */};
        let handleReflect = () => {
            let reflectAmount = BigInt(data) * piecesPerUnit;
            let reflectFrom = topics[1].toLowerCase();
            balances[reflectFrom] -= reflectAmount;
            /*if (reflectFrom == longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f"))
                console.log("reflect", reflectAmount / piecesPerUnit, log.transactionHash, balances[longAddress("0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f")] / piecesPerUnit);
            */let liquidityAddress = "0x7d4f4b77d3002ae7079d8ca6304d208512e92ca4";
            let tip = totalSupply * piecesPerUnit - balances[longAddress(liquidityAddress)];
            let tup = tip - reflectAmount;
            piecesPerUnit = piecesPerUnit * tup / tip;
            if (balances[longAddress(liquidityAddress)])
                balances[longAddress(liquidityAddress)] = balances[longAddress(liquidityAddress)] * tup / tip;
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
    points["marketMaking"] = Object.entries(points["marketMaking"]).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    points["marketMaking"] = Object.fromEntries(points["marketMaking"]);
    points["airdropping"] = Object.entries(points["airdropping"]).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    points["airdropping"] = Object.fromEntries(points["airdropping"]);

    //console.log(balances["0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f".toLowerCase()]);

    return [balances, points];
};

module.exports = exports = getBalancesAtBlock;





//console.log(getBalancesAtBlock(18195967)["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
//let balances = getBalancesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
