let fs = require("fs");
<<<<<<< HEAD
let path = require("path");
=======
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
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
<<<<<<< HEAD
    let jsonPath = path.join(__dirname, "logs.txt");
    let logs = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    let initTokens = 10n ** 18n
    let uintMax = 2n ** 128n - 1n;
=======
    let logs = JSON.parse(fs.readFileSync("./ftmTnglV3/logs.txt", "utf8"));
    let initTokens = 10n ** 18n
    let uintMax = 2n ** 256n - 1n;
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerUnit = initPieces / initTokens;
    let totalSupply = initTokens;
    let balances = {};
<<<<<<< HEAD
    let reflect = "[REDACTED]a7";
    let transfer = "[REDACTED]ef";
    balances["[REDACTED]1a"] = initPieces;
    let logIndex;
    let points = {
        "marketMaking": {},
        "airdropping": {}
    };
=======
    let reflect = "0xfb1cca2745e309250590c0f70d53bdbce480caeb94e9f16af0bf5b20ae9e16a7";
    let transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    balances["0x000000000000000000000000e1a811bdfb656dc47a7262dbde31071d9a916b1a"] = initPieces;
    let logIndex;
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
    logs.forEach((log, i) => {
        let { topics, data, blockNumber, logIndex } = log;
        if (blockNumber >= atBlock) return;
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data) * piecesPerUnit;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
<<<<<<< HEAD
            if (receiver == longAddress("0xcff6c70e174a4b8c020a81cebb75ce131c285916") && amount / piecesPerUnit >= 1000000000) {
                if (!points["marketMaking"][sender]) points["marketMaking"][sender] = 0n;
                points["marketMaking"][sender] += 1n;
            }
            if (amount / piecesPerUnit == 1000000000) {
                if (!points["airdropping"][sender]) points["airdropping"][sender] = 0n;
                points["airdropping"][sender] += 1n;
            }
            /*if (sender == longAddress("0xDF8f5313224d93Bf042cC1c765F3480792bd4442"))
                console.log("sell", amount / piecesPerUnit, log.transactionHash, balances[longAddress("0xDF8f5313224d93Bf042cC1c765F3480792bd4442")] / piecesPerUnit);
            if (receiver == longAddress("0xDF8f5313224d93Bf042cC1c765F3480792bd4442"))
                console.log("buy", amount / piecesPerUnit, log.transactionHash, balances[longAddress("0xDF8f5313224d93Bf042cC1c765F3480792bd4442")] / piecesPerUnit);*/
=======
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
            balances[sender] -= amount;
            balances[receiver] += amount;
        };
        let handleReflect = () => {
            let reflectAmount = BigInt(data) * piecesPerUnit;
            let reflectFrom = topics[1].toLowerCase();
            balances[reflectFrom] -= reflectAmount;
<<<<<<< HEAD
            /*if (reflectFrom == longAddress("0xDF8f5313224d93Bf042cC1c765F3480792bd4442"))
                console.log("reflect", reflectAmount / piecesPerUnit, log.transactionHash, balances[longAddress("0xDF8f5313224d93Bf042cC1c765F3480792bd4442")] / piecesPerUnit);*/
            let liquidityAddress = "0xcff6c70e174a4b8c020a81cebb75ce131c285916";
            let tip = totalSupply * piecesPerUnit - balances[longAddress(liquidityAddress)];
=======
            let liquidityAddress = "0xcff6c70e174a4b8c020a81cebb75ce131c285916";
            let tip = totalSupply * piecesPerUnit - balances[longAddress("0xcff6c70e174a4b8c020a81cebb75ce131c285916")];
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
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
<<<<<<< HEAD
    points["marketMaking"] = Object.entries(points["marketMaking"]).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    points["marketMaking"] = Object.fromEntries(points["marketMaking"]);
    points["airdropping"] = Object.entries(points["airdropping"]).map(e =>
        ["0x" + e[0].substr(-40).toLowerCase(), e[1]]
    );
    points["airdropping"] = Object.fromEntries(points["airdropping"]);

    return [balances, points];
=======
    return balances;
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
};

module.exports = exports = getBalancesAtBlock;

<<<<<<< HEAD
getBalancesAtBlock();

//console.log(getBalancesAtBlock()["0xe0140b519c72B5706aa06539729A8186749e4a2b".toLowerCase()]);

=======
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
//console.log(getBalancesAtBlock(18195967)["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
//let balances = getBalancesAtBlock(18195967);
//console.log(balances["0xcff6c70e174a4b8c020a81cebb75ce131c285916"]);
