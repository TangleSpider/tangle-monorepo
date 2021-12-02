let keccak256 = require("@ethersproject/keccak256").keccak256;
const util = require('util')

let auditAddress = "0x2F6eDE25f37A9Ec0C1Cf2F26C98369261f21C39f".toLowerCase();

let orbiBals = require("../orbi/getBalancesAtBlock.js")(11805179);
let orbiLpBals = require("../orbiLp/getBalancesAtBlock.js")(11805179);
let orbiInLp = orbiBals["0x840336e57708b8ba1e864b2b7db78aabeeba1691"];
let totalOrbiLpSupply = Object.values(orbiLpBals).reduce((p, c) => {;
    return c > 0 ? c + p : p;
}, 0n);
Object.entries(orbiLpBals).forEach(e => {
    if (e[1] > 0) {
        if (!orbiBals[e[0]]) orbiBals[e[0]] = 0n;
        orbiBals[e[0]] += e[1] * orbiInLp / totalOrbiLpSupply;
    }
});
// orbiBals now includes calculated orbiBals from LP holdings
let orbiV2Bals = require("../orbiV2/getBalancesAtBlock.js")(12884214);
let orbiV2LpBals = require("../orbiV2Lp/getBalancesAtBlock.js")(12884214);
let orbiV2InLp = orbiV2Bals["0xdc6a5faf34affccc6a00d580ecb3308fc1848f22".toLowerCase()];
let totalOrbiV2LpSupply = Object.values(orbiLpBals).reduce((p, c) => {
    return c > 0 ? c + p : p;
}, 0n);
Object.entries(orbiV2LpBals).forEach(e => {
    if (!orbiV2Bals[e[0]]) orbiV2Bals[e[0]] = 0n;
    orbiV2Bals[e[0]] += e[1] * 2n * orbiV2InLp / totalOrbiV2LpSupply;
});
// orbiV2Bals now includes calculated orbiV2Bals from LP holdings
Object.entries(orbiV2Bals).forEach(e => {
    if (!orbiBals[e[0]]) orbiBals[e[0]] = 0n;
    if (e[1] > orbiBals[e[0]]) orbiBals[e[0]] = e[1];
});
// orbiBals is now the max of orbiBals or orbiV2Bals per address
let sortedOrbiBals = Object.entries(orbiBals).filter(e => e[1] > 0n).sort((a, b) => {
    return parseInt(b[1] - a[1]);
});
let notIncluded = [
    "0xe1a811bdfb656dc47a7262dbde31071d9a916b1a",
    "0xbf84007b302226cb54c91130bb1bcf1e004063d0",
    "0x840336e57708b8ba1e864b2b7db78aabeeba1691",
    "0xe45b918fe144695539a7ef97d3077943354152de",
    "0xdc6a5faf34affccc6a00d580ecb3308fc1848f22",
    "0x0000000000000000000000000000000000000001",
    "0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214",
    "0xd8d2c7bb229eda3f086c687cf3b89f42847c4bb5"
];
let filteredOrbiBals = sortedOrbiBals.filter(e => notIncluded.indexOf(e[0]) == -1 && e[1] > 1);

let ftmTnglBals = require("../avaxTnglV3/getBalancesAtBlock")(5152854)[0];
let ftmTnglLpBals = require("../avaxTnglV3Lp/getBalancesAtBlock")(5152854);
//console.log(ftmTnglLpBals);
let ftmTnglInLp = ftmTnglBals["0x7870B42206ed0bC0c53BdDeDCf684c96F70327c1".toLowerCase()];
let totalFtmTnglLpSupply = Object.values(ftmTnglLpBals).reduce((p, c) => {
    return c > 0 ? c + p : p;
}, 0n);
let airdropFix = {};
notIncluded = [
    "0xe1a811bdfb656dc47a7262dbde31071d9a916b1a".toLowerCase(), // dev
    "0x7870B42206ed0bC0c53BdDeDCf684c96F70327c1".toLowerCase(), // liq
    "0x6E8c185F2Fb1C2Dd07B052d107c47F9287ea0AF2".toLowerCase(), // liqLock
    "0xAf1843657F00F8C048139B7103784fdeFC403702".toLowerCase(), // token
    "0x000000000000000000000000000000000000dead".toLowerCase()  // dead
];
//console.log("TNGLV3", ftmTnglBals[auditAddress]);
Object.entries(ftmTnglBals).forEach(e => {
    if (notIncluded.indexOf(e[0]) == -1 && e[1] > 1100000000) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1];
    }
});
Object.entries(ftmTnglLpBals).forEach(e => {
    if (!ftmTnglBals[e[0]]) ftmTnglBals[e[0]] = 0n;
    ftmTnglBals[e[0]] += e[1] * ftmTnglInLp / totalFtmTnglLpSupply;
    if (ftmTnglBals[e[0]] > 0 && notIncluded.indexOf(e[0]) == -1) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        //if (e[1] == auditAddress) console.log("from liquidity", e[1] * 2n * ftmTnglInLp / totalFtmTnglLpSupply);
        airdropFix[e[0]] += e[1] * 2n * ftmTnglInLp / totalFtmTnglLpSupply;
    }
});
let sortedFtmTnglBals = Object.entries(ftmTnglBals).filter(e => e[1] > 0n).sort((a, b) => {
    return parseInt(b[1] - a[1]);
});

filteredFtmTnglBals = sortedFtmTnglBals.filter(
    e => {
        return notIncluded.indexOf(e[0]) == -1 &&
        e[1] > 1100000000;
    }
);
airdropFix = Object.fromEntries(
    Object.entries(airdropFix).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
let totalRewards = ftmTnglBals["0xAf1843657F00F8C048139B7103784fdeFC403702".toLowerCase()];
let points = require("../avaxTnglV3/getBalancesAtBlock")(5152854)[1];
points["marketMaking"] = Object.fromEntries(
    Object.entries(points["marketMaking"]).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
points["airdropping"] = Object.fromEntries(
    Object.entries(points["airdropping"]).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
ftmTnglLpBals = Object.fromEntries(
    Object.entries(ftmTnglLpBals).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
let totalMMPoints = Object.entries(points["marketMaking"]).reduce((p, c) => { return p + c[1]; }, 0n);
let totalAPoints = Object.entries(points["airdropping"]).reduce((p, c) => { return p + c[1]; }, 0n);
let totalSPoints = Object.entries(ftmTnglLpBals).reduce((p, c) => { return c[1] > 0 ? p + c[1] : p; }, 0n);
Object.entries(points["marketMaking"]).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards / totalMMPoints / 3n;
});
Object.entries(points["airdropping"]).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards / totalAPoints / 3n;
});
Object.entries(ftmTnglLpBals).filter(e => e[1] > 0).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards / totalSPoints / 3n;
});
let totalTnglToV3Holders = filteredFtmTnglBals.reduce((p, c) => {
    return p + c[1];
}, 0n);
let tnglBals = {};
let totalFromFtmTnglV3 = 0n;
let totalFromOrbi = 0n;
filteredFtmTnglBals.forEach(e => {
    if (!tnglBals[e[0]]) tnglBals[e[0]] = 0n;
    tnglBals[e[0]] += e[1] + e[1] * totalRewards / totalTnglToV3Holders;
    totalFromFtmTnglV3 += e[1] + e[1] * totalRewards / totalTnglToV3Holders;
});
let orbiBalsTotal = filteredOrbiBals.reduce((p, c) => {
    return p + c[1];
}, 0n);
//console.log(orbiBalsTotal);
filteredOrbiBals.forEach(e => {
    if (e[1] * 136n / 10000n > 0) {
        if (!tnglBals[e[0]]) tnglBals[e[0]] = 0n;
        tnglBals[e[0]] += e[1] * 10n ** 18n * 379n / orbiBalsTotal / 10000n;
        totalFromOrbi += e[1] * 10n ** 18n * 379n / orbiBalsTotal / 10000n;
    }
});

//console.log("totalAirdrop", airdropFix[auditAddress]);

airdropFix = Object.fromEntries(
    Object.entries(airdropFix).map(e =>
        [e[0], tnglBals[e[0]] ? e[1] - tnglBals[e[0]] : e[1]]
    ).filter(e => e[1] > 0)
);
/*console.log(Object.entries(airdropFix).reduce((p, c) => { return p + c[1]; }, 0n));
console.log([JSON.stringify(Object.keys(airdropFix)), JSON.stringify(Object.values(airdropFix).map(i => i.toString()))]);
*/
/*console.log(filteredOrbiBals[0]);
console.log(tnglBals[filteredOrbiBals[0][0]]);*/

/*console.log("total in rewards system", totalRewards);
console.log("mmPoints", points["marketMaking"][auditAddress], totalMMPoints);
console.log("aPoints", points["airdropping"][auditAddress], totalAPoints);
console.log("sPoints", ftmTnglLpBals[auditAddress], totalSPoints);
console.log("mmAirdrop", points["marketMaking"][auditAddress] ? points["marketMaking"][auditAddress] * totalRewards / totalMMPoints / 3n : 0n);
console.log("aAirdrop", points["airdropping"][auditAddress] ? points["airdropping"][auditAddress] * totalRewards / totalAPoints / 3n : 0n);
console.log("sAirdrop", ftmTnglLpBals[auditAddress] ? ftmTnglLpBals[auditAddress] * totalRewards / totalSPoints / 3n : 0n);
console.log("airdropFix", airdropFix[auditAddress]);
console.log("airdropFixTotal", Object.entries(airdropFix).reduce((p, c) => { return p + c[1]; }, 0n));
console.log("previously airdropped", tnglBals[auditAddress.toLowerCase()]);

console.log(
    totalFromFtmTnglV3,
    totalFromOrbi,
    totalFromFtmTnglV3 + totalFromOrbi,
    Object.entries(tnglBals).reduce((p, c) => { return p + c[1]; }, 0n)
);*/
let cuts = 4;
let cutLength = parseInt(Object.entries(tnglBals).length / cuts);
let tnglBalsEntries = Object.entries(tnglBals);
for (let i = 0; i < parseInt(Object.entries(tnglBals).length / cutLength); i++) {
    let output = [];
    if (i == 0) {
        //console.log(0);
        output.push(tnglBalsEntries.slice(0, cutLength).map(e => e[0]));
        output.push(tnglBalsEntries.slice(0, cutLength).map(e => e[1].toString()));
    } else if (i == parseInt(Object.entries(tnglBals).length / cutLength) - 1) {
        //console.log(1);
        output.push(tnglBalsEntries.slice(cutLength * i).map(e => e[0]));
        output.push(tnglBalsEntries.slice(cutLength * i).map(e => e[1].toString()));
    } else {
        //console.log(2);
        output.push(tnglBalsEntries.slice(cutLength * i, cutLength * i + cutLength).map(e => e[0]));
        output.push(tnglBalsEntries.slice(cutLength * i, cutLength * i + cutLength).map(e => e[1].toString()));
    }
    /*console.log(JSON.stringify(output[0]));
    console.log(JSON.stringify(output[1]));
    console.log("\n");*/
}
/*let tree = [filteredOrbiBals.map(a => keccak256(a[0] + a[1].toString(16).padStart(64, '0')))];
for (let j = 0; j < Math.ceil(Math.log2(tree[0].length)); j++) {
    let newLayer = [];
    for (let i = 0; i < tree[j].length / 2; i++) {
        if (!tree[j][i * 2 + 1]) tree[j].push("0x" + "".padEnd(64, '0'));
        newLayer.push(keccak256(tree[j][i * 2] + tree[j][i * 2 + 1].substr(2)));
    }
    tree.push(newLayer);
}
//console.log(tree);

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

console.log(generateProof(tree, 500));

let verifyProof = (proof, root, leaf, index) => {
    let hash = keccak256(leaf);
    //console.log(hash);
    for (let i = 0; i < proof.length; i++) {
        if (index % 2 == 0) {
            hash = keccak256(hash + proof[i].substr(2));
            //console.log(hash);
        } else {
            hash = keccak256(proof[i] + hash.substr(2));
            //console.log(hash);
        }
        index = parseInt(index / 2);
        //console.log(index);
    }
    //console.log(hash, root, hash == root);
    return hash == root;
};

console.log(
    filteredOrbiBals[500],
    verifyProof(
        generateProof(tree, 500),
        tree[tree.length - 1],
        filteredOrbiBals[500][0] + filteredOrbiBals[500][1].toString(16).padStart(64, '0'),
        500
    )
);

/*let verifyAddress = address => {
    let index = filteredOrbiBals.indexOf(address);
    let proof = generateProof(tree, index);
    return verifyProof(
        proof,
        tree[tree.length - 1][0],
        address,
        index
    );
};
let index = filteredOrbiBals.length - 1;

let randBits = (bits, loops) => {
    let rand = "";
    for (let i = 0; i < loops; i++)
        rand += (parseInt(Math.random() * 2 ** bits)).toString(16).padStart(bits / 8 * 2, '0');
    return "0x" + rand;
};
for (let i = 0; i < filteredOrbiBals.length; i++) {
    if (Math.random() < 0.5) {
        let randAddress = randBits(32, 5);
        let randUInt = randBits(32, 8);
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
    if (verifyAddress(filteredOrbiBals[i])) {
        console.log(`address ${filteredOrbiBals[i]} verified`);
    } else {
        console.log(`address ${filteredOrbiBals[i]} unverified`);
        return;
    }
}
console.log("all addresses verified");*/

module.exports = exports = tnglBals;
