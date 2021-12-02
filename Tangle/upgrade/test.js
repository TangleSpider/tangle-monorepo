let keccak256 = require("@ethersproject/keccak256").keccak256;
let rootNth = (val, k=2n) => {
    let o = 0n; // old approx value
    let x = val;
    let limit = 100;

    while(x**k!==k && x!==o && --limit) {
      o=x;
      x = ((k-1n)*x + val/x**(k-1n))/k;
    }

    return x;
};
let fs = require("fs");
let address = "".toLowerCase();
let addressLong = "0x" + address.substr(2).padStart(64, '0');
let addressRegExp = new RegExp(address.substr(2), 'i');
let formattedAddress = `${address.substr(0, 5)}...${address.substr(-3)}`;
let fmtAmtDec = (amount, decimals) => {
    amount = amount.toString();
    amount = amount.replace(new RegExp(`(?=\\d{${decimals}})(?!\\d{${decimals + 1},})`), '.');
    amount = amount.replace(/\d(?=(\d{3})+\.)/g, "$&,");
    return amount.padStart(24, ' ');
};
let getOrbiBalances = () => {
    let initTokens = 10n ** 17n
    let uintMax = 2n ** 256n - 1n;
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerToken = initPieces / initTokens;
    let totalSupply = initTokens;
    let logs = JSON.parse(fs.readFileSync("./logs/orbiLogs.txt", "utf8"));
<<<<<<< HEAD
    let transferTopic = "[REDACTED]ef";
    let rebaseTopic = "[REDACTED]f2";
=======
    let transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let rebaseTopic = "0x72725a3b1e5bd622d6bcd1339bb31279c351abe8f541ac7fd320f24e1b1641f2";
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
    let balances = {};
    let fromAzizLpBalances = {};
    let fromArsuLpBalances = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        if (blockNumber >= 11805179) return;
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data) * piecesPerToken;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            if (address && sender.match(addressRegExp))
                console.log(`${formattedAddress} ${"sent".padStart(16, ' ')} ${fmtAmtDec(amount / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[sender] / piecesPerToken, 9)}`);
            balances[receiver] += amount;
            if (address && receiver.match(addressRegExp))
                console.log(`${formattedAddress} ${"received".padStart(16, ' ')} ${fmtAmtDec(amount / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[receiver] / piecesPerToken, 9)}`);
            if (
                sender.match(/5b92de3a82739fd4762c15da31de72ef18453dbe/i) ||
                receiver.match(/5b92de3a82739fd4762c15da31de72ef18453dbe/i) ||
                sender.match(/a810ad36e545e3db009cc8ca53930f3d76a7e8e9/i) ||
                receiver.match(/a810ad36e545e3db009cc8ca53930f3d76a7e8e9/i)
            ) {
                if (!fromAzizLpBalances[sender]) fromAzizLpBalances[sender] = 0n;
                if (!fromAzizLpBalances[receiver]) fromAzizLpBalances[receiver] = 0n;
                if (!fromArsuLpBalances[sender]) fromArsuLpBalances[sender] = 0n;
                if (!fromArsuLpBalances[receiver]) fromArsuLpBalances[receiver] = 0n;
            }
            if (sender.match(/5b92de3a82739fd4762c15da31de72ef18453dbe/i)) fromAzizLpBalances[receiver] += amount;
            if (receiver.match(/5b92de3a82739fd4762c15da31de72ef18453dbe/i)) fromAzizLpBalances[sender] -= amount;
            if (sender.match(/a810ad36e545e3db009cc8ca53930f3d76a7e8e9/i)) fromArsuLpBalances[receiver] += amount;
            if (receiver.match(/a810ad36e545e3db009cc8ca53930f3d76a7e8e9/i)) fromArsuLpBalances[sender] += amount;
        };
        let handleRebase = () => {
            totalSupply = BigInt(data);
            piecesPerToken = initPieces / totalSupply;
            if (address && balances[addressLong])
                console.log(`${formattedAddress} ${"rebased".padStart(16, ' ')} ${"".padStart(24, ' ')} ORBI balance now ${fmtAmtDec(balances[addressLong] / piecesPerToken, 9)}`);
        };
        switch (topics[0]) {
            case rebaseTopic:
                handleRebase();
                break;
            case transferTopic:
                handleTransfer();
                break;
        }
    });
    let combinedFromTwinLpBalances = {};
    Object.entries(fromAzizLpBalances).forEach(e => {
        if (!combinedFromTwinLpBalances[e[0]]) combinedFromTwinLpBalances[e[0]] = 0n;
        combinedFromTwinLpBalances[e[0]] += e[1] * -1n;
    });
    Object.entries(fromArsuLpBalances).forEach(e => {
        if (!combinedFromTwinLpBalances[e[0]]) combinedFromTwinLpBalances[e[0]] = 0n;
        combinedFromTwinLpBalances[e[0]] += e[1] * -1n;
    });
    Object.entries(combinedFromTwinLpBalances).forEach(e => {
        if (e[1] < 0n) {
            if (!balances[e[0]]) balances[e[0]] = 0n;
            balances[e[0]] += e[1] * -1n;
            if (address && e[0].match(addressRegExp))
                console.log(`${formattedAddress}${"twin'd".padStart(9, ' ')} ${fmtAmtDec(e[1] * -1n / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[e[0]] / piecesPerToken, 9)}`);
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40), e[1] / piecesPerToken]
    );
    balances = balances.filter(e => e[1] > 0);
    balances = Object.fromEntries(balances);
    return balances;
};
let getFtmTnglV3Balances = () => {
    let initTokens = 10n ** 18n
    let uintMax = 2n ** 256n - 1n;
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerToken = initPieces / initTokens;
    let totalSupply = initTokens;
    let logs = JSON.parse(fs.readFileSync("./logs/ftmTnglV3Logs.txt", "utf8"));
<<<<<<< HEAD
    let reflect = "[REDACTED]a7";
    let transferTopic = "[REDACTED]ef";
=======
    let reflect = "0xfb1cca2745e309250590c0f70d53bdbce480caeb94e9f16af0bf5b20ae9e16a7";
    let transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
    let balances = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        if (blockNumber >= 18196284) return;
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data) * piecesPerToken;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            if (address && sender.match(addressRegExp))
                console.log(`${formattedAddress} ${"sent".padStart(16, ' ')} ${fmtAmtDec(amount / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[sender] / piecesPerToken, 9)}`);
            balances[receiver] += amount;
            if (address && receiver.match(addressRegExp))
                console.log(`${formattedAddress} ${"received".padStart(16, ' ')} ${fmtAmtDec(amount / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[receiver] / piecesPerToken, 9)}`);
        };
        let handleReflect = () => {
            console.log(log);
        };
        switch (topics[0]) {
            case transferTopic:
                handleTransfer();
                break;
            case reflect:
                handleReflect();
                break;
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40), e[1] / piecesPerToken]
    );
    balances = balances.filter(e => e[1] > 0);
    balances = Object.fromEntries(balances);
    return balances;
};
let getAvaxTnglV3Balances = () => {
    let initTokens = 10n ** 18n
    let uintMax = 2n ** 256n - 1n;
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerToken = initPieces / initTokens;
    let totalSupply = initTokens;
    let logs = JSON.parse(fs.readFileSync("./logs/avaxTnglV3Logs.txt", "utf8"));
<<<<<<< HEAD
    let transferTopic = "[REDACTED]ef";
=======
    let transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
    let balances = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        if (blockNumber >= 5154915) return;
        let handleTransfer = () => {
            let sender = topics[1].toLowerCase();
            let receiver = topics[2].toLowerCase();
            let amount = BigInt(data) * piecesPerToken;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            if (address && sender.match(addressRegExp))
                console.log(`${formattedAddress} ${"sent".padStart(16, ' ')} ${fmtAmtDec(amount / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[sender] / piecesPerToken, 9)}`);
            balances[receiver] += amount;
            if (address && receiver.match(addressRegExp))
                console.log(`${formattedAddress} ${"received".padStart(16, ' ')} ${fmtAmtDec(amount / piecesPerToken, 9)} ORBI balance now ${fmtAmtDec(balances[receiver] / piecesPerToken, 9)}`);
        };
        switch (topics[0]) {
            case transferTopic:
                handleTransfer();
                break;
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40), e[1] / piecesPerToken]
    );
    balances = balances.filter(e => e[1] > 0);
    balances = Object.fromEntries(balances);
    return balances;
};
let getOrbiV2Balances = () => {
    let getOrbiV2BalancesFromLp = () => {
        let logs = JSON.parse(fs.readFileSync("./logs/orbiV2LpLogs.txt", "utf8"));
<<<<<<< HEAD
        let transfer = "[REDACTED]ef";
        let sync = "[REDACTED]d1";
=======
        let transfer = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        let sync = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1";
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
        let reserves = [null, null];
        let balances = {};
        let staked = {};
        let totalSupply = 0n;
        logs.forEach((log, i) => {
            let { topics, data, blockNumber } = log;
            if (blockNumber >= 12884202) return;
            let handleTransfer = () => {
                let sender = topics[1];
                let receiver = topics[2];
                let amount = BigInt(data)
                if (!balances[sender]) balances[sender] = 0n;
                if (!balances[receiver]) balances[receiver] = 0n;
                balances[sender] -= amount;
                balances[receiver] += amount;
                if (receiver.match(/dc6a5faf34affccc6a00d580ecb3308fc1848f22/i))
                    totalSupply -= amount;
                if (sender.match(/0000000000000000000000000000000000000000/i))
                    totalSupply += amount;
                if (
                    receiver.match(/f8fbf0b2ccdf612189987b5479624433a205a929/i) ||
                    receiver.match(/5c027183304b71a409f80b308b69ad0c7218759f/i) ||
                    receiver.match(/e45b918fe144695539a7ef97d3077943354152de/i)
                ) {
                    if (!staked[sender]) staked[sender] = 0n;
                    staked[sender] += amount;
                    balances[sender] += amount;
                }
                if (
                    sender.match(/f8fbf0b2ccdf612189987b5479624433a205a929/i) ||
                    sender.match(/5c027183304b71a409f80b308b69ad0c7218759f/i) ||
                    sender.match(/e45b918fe144695539a7ef97d3077943354152de/i)
                ) {
                    if (!staked[receiver]) staked[receiver] = 0n;
                    staked[receiver] -= amount;
                    balances[receiver] -= amount;
                }
            };
            let handleSync = () => {
                reserves = data.match(/[0-9a-f]{64}/gi).map(r => BigInt("0x" + r));
            };
            switch (topics[0]) {
                case sync: handleSync(); break;
                case transfer: handleTransfer(); break;
            }
        });
        balances = Object.entries(balances).map(e =>
            ["0x" + e[0].substr(-40), e[1]]
        );
        balances = balances.filter(e => e[1] > 0);
        balances = Object.fromEntries(balances);
        return Object.fromEntries(Object.entries(balances).map(
            e => [e[0], e[1] * reserves[0] / totalSupply * 2n]
        ));
    };
    let initTokens = 10n ** 17n
    let uintMax = 2n ** 256n - 1n;
    let initPieces = uintMax - (uintMax % initTokens);
    let piecesPerToken = initPieces / initTokens;
    let totalSupply = initTokens;
    let logs = JSON.parse(fs.readFileSync("./logs/orbiV2Logs.txt", "utf8"));
<<<<<<< HEAD
    let transferTopic = "[REDACTED]ef";
    let rebaseTopic = "[REDACTED]7f";
=======
    let transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let rebaseTopic = "0x0b7e711d124e53e17b23a99f1ccbb839f29f7988434c16a32905c49fd25c067f";
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e
    let balances = {};
    let toAzizV2Lp = {};
    let toArsuV2Lp = {};
    logs.forEach((log, i) => {
        let { topics, data, blockNumber } = log;
        if (blockNumber >= 12884202) return;
        let handleTransfer = () => {
            let sender = topics[1];
            let receiver = topics[2];
            let amount = BigInt(data) * piecesPerToken;
            if (!balances[sender]) balances[sender] = 0n;
            if (!balances[receiver]) balances[receiver] = 0n;
            balances[sender] -= amount;
            balances[receiver] += amount;
        };
        let handleRebase = () => {
            data = BigInt(data);
            if (data & 2n ** (256n - 1n)) data = (2n ** 256n - data) * -1n;
            totalSupply += data;
            piecesPerToken = initPieces / totalSupply;
        };
        switch (topics[0]) {
            case rebaseTopic:
                handleRebase();
                break;
            case transferTopic:
                handleTransfer();
                break;
        }
    });
    balances = Object.entries(balances).map(e =>
        ["0x" + e[0].substr(-40), e[1] / piecesPerToken]
    );
    balances = balances.filter(e => e[1] > 0);
    balances = Object.fromEntries(balances);
    Object.entries(getOrbiV2BalancesFromLp()).forEach(e => {
        if (!balances[e[0]]) balances[e[0]] = 0n;
        balances[e[0]] += e[1];
    });
    return balances;
};
let orbiBalances = getOrbiBalances();
if (address && orbiBalances[address])
    console.log(`${formattedAddress} final ORBI balance: ${fmtAmtDec(orbiBalances[address], 9)}`);
//console.log(orbiBalances);
let orbiV2Balances = getOrbiV2Balances();
//console.log(orbiV2Balances);
let ftmTnglV3Balances = getFtmTnglV3Balances();
let ftmTnglV3Interactors = Object.keys(ftmTnglV3Balances);
//console.log(ftmTnglV3Balances);
/*let avaxTnglV3Balances = getAvaxTnglV3Balances();
let avaxTnglV3Interactors = Object.keys(avaxTnglV3Balances)
let interactors = avaxTnglV3Interactors;

/*let tree = [interactors.map(a => keccak256(a))];
console.log(tree[0].length);
for (let j = 0; j < Math.ceil(Math.log2(tree[0].length)); j++) {
    let newLayer = [];
    for (let i = 0; i < tree[j].length / 2; i++) {
        if (!tree[j][i * 2 + 1]) tree[j].push("0x" + "".padEnd(64, '0'));
        newLayer.push(keccak256(tree[j][i * 2] + tree[j][i * 2 + 1].substr(2)));
    }
    tree.push(newLayer);
}
console.log(tree);

let generateProof = (tree, index) => {
    let layer = 0;
    let proof;
    let indexProof;
    if (index % 2 == 0n) {
        proof = [tree[layer][index + 1]];
        indexProof = [index + 1];
    } else {
        proof = [tree[layer][index - 1]];
        indexProof = [index - 1];
    }
    index = parseInt(index / 2);
    layer++;
    for (let i = 0; i < Math.ceil(Math.log2(tree[0].length)) - 1; i++) {
        if (index % 2 == 0) {
            proof.push(tree[layer][index + 1]);
            indexProof.push(index + 1);
        } else {
            proof.push(tree[layer][index - 1]);
            indexProof.push(index - 1);
        }
        index = parseInt(index / 2);
        layer++;
    }
    return proof;
};
console.log(generateProof(tree, 0));
<<<<<<< HEAD
//console.log(keccak256("[REDACTED]61" + "[REDACTED]"))
=======
//console.log(keccak256("0x24f59a773125f8197d4688af1c666caacbd6548906da9ff5643e76dd757d1261" + "441382a86be5dfa4cb8412c7e14eb268abc1df733c579b03eb2c77d54d345ee2"))
>>>>>>> 825d69c2ad34fe04caae69b843f5255f92613b8e

let verifyProof = (proof, root, leaf, index) => {
    let hash = keccak256(leaf);
    for (let i = 0; i < proof.length; i++) {
        if (index % 2 == 0) {
            hash = keccak256(hash + proof[i].substr(2));
        } else {
            hash = keccak256(proof[i] + hash.substr(2));
        }
        index = parseInt(index / 2);
    }
    return hash == root;
};
//console.log(verifyProof(generateProof(tree, 0), tree[tree.length - 1][0], interactors[0], 0));
let verifyAddress = address => {
    let index = interactors.indexOf(address);
    let proof = generateProof(tree, index);
    return verifyProof(
        proof,
        tree[tree.length - 1][0],
        address,
        index
    );
};
let index = interactors.length - 1;
//console.log(JSON.stringify(generateProof(tree, index)), avaxTnglV3Interactors[index], index);
let randBits = (bits, loops) => {
    let rand = "";
    for (let i = 0; i < loops; i++)
        rand += (parseInt(Math.random() * 2 ** bits)).toString(16).padStart(bits / 8 * 2, '0');
    return "0x" + rand;
};
/*for (let i = 0; i < interactors.length; i++) {
    if (Math.random() < 0.5) {
        let randAddress = randBits(32, 5);
        let randIndex = parseInt(Math.random() * tree[0].length);
        let randVerify = verifyProof(
            generateProof(tree, randIndex),
            tree[tree.length - 1][0],
            randAddress,
            randIndex
        );
        if (randVerify[0]) {
            console.log(`random check: address ${randAddress} verified`);
            return;
        } else {
            console.log(`random check: address ${randAddress} unverified`);
        }
    }
    if (verifyAddress(interactors[i])) {
        console.log(`address ${interactors[i]} verified`);
    } else {
        console.log(`address ${interactors[i]} unverified`);
        return;
    }
}
console.log("all addresses verified");*/
