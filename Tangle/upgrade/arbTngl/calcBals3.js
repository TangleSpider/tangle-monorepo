let auditAddress = "0x9A83542aA592249a12C5dd067f50EDcE63e29EcE".toLowerCase();
let keccak256 = require("@ethersproject/keccak256").keccak256;
const util = require('util')

let fta = (value, decimals) => {
    let rx = new RegExp(`\\d{${decimals}}$`);
    return String(value)
        .padStart(decimals + 1, '0')
        .replace(rx, ".$&")
        .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',');
};

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
let orbiV2Bals = require("../orbiV2/getBalancesAtBlock2.js")(12884214);
//console.log(orbiV2Bals["0x756e87e8fc39ae79d3d0c0fe8f8561316d77451a".toLowerCase()]);
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
let notIncluded = [
    "0xe1a811bdfb656dc47a7262dbde31071d9a916b1a",
    "0xbf84007b302226cb54c91130bb1bcf1e004063d0",
    "0x840336e57708b8ba1e864b2b7db78aabeeba1691",
    "0xe45b918fe144695539a7ef97d3077943354152de",
    "0xdc6a5faf34affccc6a00d580ecb3308fc1848f22",
    "0x0000000000000000000000000000000000000001",
    "0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214",
    //"0xd8d2c7bb229eda3f086c687cf3b89f42847c4bb5"
];
orbiBals = Object.fromEntries(Object.entries(orbiBals).filter(e => notIncluded.indexOf(e[0]) == -1 && e[1] > 0));
let orbiBalsTotal = Object.entries(orbiBals).reduce((p, c) => { return c[1] > 0 ? p + c[1] : p; }, 0n);
orbiBals = Object.fromEntries(
    Object.entries(orbiBals).map(e => [
        e[0],
        e[1] * 10n ** 17n * 10n * 757n / 10000n / orbiBalsTotal
    ])
);
//console.log(Object.entries(orbiBals).reduce((p, c) => { return p + c[1]; }, 0n));

let tnglBals = {}; //require("./calcBals.js");
let tnglBals2 = {}; //require("./calcBals2.js");

/*let ftmTngl1Bals = require("../bscTnglV1/getBalancesAtBlock")(10370565)[0];
//console.log(ftmTngl1Bals);
let tnglFromV1 = ftmTngl1Bals[auditAddress];
let ftmTngl2Bals = require("../bscTnglV2/getBalancesAtBlock")(10517279)[0];
let tnglFromV2 = ftmTngl2Bals[auditAddress];*/
let ftmTnglBals = require("../arbTnglV3/getBalancesAtBlock")(1874254)[0];
let tnglFromV3 = ftmTnglBals[auditAddress];
let totalRewards = ftmTnglBals["0x69f012e4dd7c2dd75cd02ccb239e42642647e0cd".toLowerCase()];
/*let totalRewards1 = (
    ftmTnglBals["0x87bba222642e6d5a09eaa90c03c2724757ef851c".toLowerCase()] ?
    ftmTnglBals["0x87bba222642e6d5a09eaa90c03c2724757ef851c".toLowerCase()] :
    0n
);
let totalRewards2 = (
    ftmTnglBals["0xc78e9c6d68e9ddc4d635724608f6b369c593b190".toLowerCase()] ?
    ftmTnglBals["0xc78e9c6d68e9ddc4d635724608f6b369c593b190".toLowerCase()] :
    0n
);*/
/*let ftmTngl1LpBals = require("../bscTnglV1Lp/getBalancesAtBlock")(10370565);
let ftmTngl2LpBals = require("../bscTnglV2Lp/getBalancesAtBlock")(10517279);*/
let ftmTnglLpBals = require("../arbTnglV3Lp/getBalancesAtBlock")(1874254);
ftmTnglLpBals = Object.fromEntries(Object.entries(ftmTnglLpBals).filter(e => e[1] > 0));
/*ftmTnglLp1Bals = Object.fromEntries(Object.entries(ftmTnglLpBals).filter(e => e[1] > 0));
ftmTnglLp2Bals = Object.fromEntries(Object.entries(ftmTnglLpBals).filter(e => e[1] > 0));*/
let ftmTnglInLp = ftmTnglBals["0xb3b030f1494dcf1872152460c0e9c8b9ab74b39b".toLowerCase()];
/*let ftmTngl1InLp = ftmTngl1Bals["0x22031f9706fab2fb0feff279e89cbaaea5d763de".toLowerCase()];
let ftmTngl2InLp = ftmTngl2Bals["0x7d4f4b77d3002ae7079d8ca6304d208512e92ca4".toLowerCase()];*/
let totalFtmTnglLpSupply = Object.values(ftmTnglLpBals).reduce((p, c) => { return c > 0 ? c + p : p; }, 0n);
/*let totalFtmTngl1LpSupply = Object.values(ftmTnglLpBals).reduce((p, c) => { return c > 0 ? c + p : p; }, 0n);
let totalFtmTngl2LpSupply = Object.values(ftmTnglLpBals).reduce((p, c) => { return c > 0 ? c + p : p; }, 0n);*/
let airdropFix = {};
let fromPreTangle;
Object.entries(orbiBals).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    if (e[0] == auditAddress) {
        fromPreTangle = e[1];
    }
    airdropFix[e[0]] += e[1];
});
//console.log(Object.entries(airdropFix).reduce((p, c) => { return p + c[1]; }, 0n));
notIncluded = [
    "0xe1a811bdfb656dc47a7262dbde31071d9a916b1a".toLowerCase(), // dev
    "0x69f012e4dd7c2dd75cd02ccb239e42642647e0cd".toLowerCase(), // v3
    "0xb3b030f1494dcf1872152460c0e9c8b9ab74b39b".toLowerCase(), // LPv3
    "0x2f96f61a027b5101e966ec1ba75b78f353259fb3".toLowerCase(), // lockV3
    "0x000000000000000000000000000000000000dead".toLowerCase(), // dead
    "0x0000000000000000000000000000000000000000".toLowerCase(), // zero
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D".toLowerCase()  // uniswap
];


/*Object.entries(ftmTngl1Bals).forEach(e => {
    if (notIncluded.indexOf(e[0]) == -1 && e[1] > 1100000000) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1];
    }
});
let tnglV1FromLiquidity = {};
Object.entries(ftmTngl1LpBals).forEach(e => {
    if (e[1] > 0 && notIncluded.indexOf(e[0]) == -1) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        //console.log(e, 2n, ftmTngl1InLp, totalFtmTngl1LpSupply);
        airdropFix[e[0]] += e[1] * 2n * ftmTngl1InLp / totalFtmTngl1LpSupply;
        if (!tnglV1FromLiquidity[e[0]]) tnglV1FromLiquidity[e[0]] = 0n;
        tnglV1FromLiquidity[e[0]] += e[1] * 2n * ftmTngl1InLp / totalFtmTngl1LpSupply;
    }
});

Object.entries(ftmTngl2Bals).forEach(e => {
    if (notIncluded.indexOf(e[0]) == -1 && e[1] > 1100000000) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1];
    }
});
let tnglV2FromLiquidity = {};
Object.entries(ftmTngl2LpBals).forEach(e => {
    if (e[1] > 0 && notIncluded.indexOf(e[0]) == -1) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1] * 2n * ftmTngl2InLp / totalFtmTngl2LpSupply;
        if (!tnglV2FromLiquidity[e[0]]) tnglV2FromLiquidity[e[0]] = 0n;
        tnglV2FromLiquidity[e[0]] += e[1] * 2n * ftmTngl2InLp / totalFtmTngl2LpSupply;
    }
});*/

Object.entries(ftmTnglBals).forEach(e => {
    if (notIncluded.indexOf(e[0]) == -1 && e[1] > 1100000000) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1];
    }
});
//console.log(Object.entries(airdropFix).reduce((p, c) => { return p + c[1]; }, 0n));
let tnglV3FromLiquidity = {};
Object.entries(ftmTnglLpBals).forEach(e => {
    if (e[1] > 0 && notIncluded.indexOf(e[0]) == -1) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1] * 2n * ftmTnglInLp / totalFtmTnglLpSupply;
        if (!tnglV3FromLiquidity[e[0]]) tnglV3FromLiquidity[e[0]] = 0n;
        tnglV3FromLiquidity[e[0]] += e[1] * 2n * ftmTnglInLp / totalFtmTnglLpSupply;
    }
});

airdropFix = Object.fromEntries(
    Object.entries(airdropFix).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);



/*let points1 = require("../bscTnglV1/getBalancesAtBlock")(10370565)[1];
points1["marketMaking"] = Object.fromEntries(
    Object.entries(points1["marketMaking"]).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
points1["airdropping"] = Object.fromEntries(
    Object.entries(points1["airdropping"]).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
ftmTngl1LpBals = Object.fromEntries(
    Object.entries(ftmTngl1LpBals).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
let totalMMPoints1 = Object.entries(points1["marketMaking"]).reduce((p, c) => { return p + c[1]; }, 0n);
let totalAPoints1 = Object.entries(points1["airdropping"]).reduce((p, c) => { return p + c[1]; }, 0n);
let totalSPoints1 = Object.entries(ftmTngl1LpBals).reduce((p, c) => { return c[1] > 0 ? p + c[1] : p; }, 0n);
Object.entries(points1["marketMaking"]).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += (e[1] ? e[1] : 0n) * totalRewards1 / totalMMPoints1 / 3n;
});
Object.entries(points1["airdropping"]).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards1 / totalAPoints1 / 3n;
});
Object.entries(ftmTngl1LpBals).filter(e => e[1] > 0).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards1 / totalSPoints1 / 3n;
});

let points2 = require("../bscTnglV2/getBalancesAtBlock")(10517279)[1];
points2["marketMaking"] = Object.fromEntries(
    Object.entries(points2["marketMaking"]).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
points2["airdropping"] = Object.fromEntries(
    Object.entries(points2["airdropping"]).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
ftmTngl2LpBals = Object.fromEntries(
    Object.entries(ftmTngl2LpBals).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
let totalMMPoints2 = Object.entries(points2["marketMaking"]).reduce((p, c) => { return p + c[1]; }, 0n);
let totalAPoints2 = Object.entries(points2["airdropping"]).reduce((p, c) => { return p + c[1]; }, 0n);
let totalSPoints2 = Object.entries(ftmTngl2LpBals).reduce((p, c) => { return c[1] > 0 ? p + c[1] : p; }, 0n);
Object.entries(points2["marketMaking"]).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards2 / totalMMPoints2 / 3n;
});
Object.entries(points2["airdropping"]).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards2 / totalAPoints2 / 3n;
});
Object.entries(ftmTngl2LpBals).filter(e => e[1] > 0).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * totalRewards2 / totalSPoints2 / 3n;
});*/

let points = require("../arbTnglV3/getBalancesAtBlock")(11444681)[1];
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



let auditAirdropTotal = airdropFix[auditAddress];
let reverseAirdropFix = Object.fromEntries(
    Object.entries(airdropFix).map(e =>
        [
            e[0],
            -(e[1] - (
                0n/* +
                (tnglBals[e[0]] ? tnglBals[e[0]] : 0n) +
                (tnglBals2[e[0]] ? tnglBals2[e[0]] : 0n)*/
            ))
        ]
    ).filter(e => e[1] > 0)
);
airdropFix = Object.fromEntries(
    Object.entries(airdropFix).map(e =>
        [
            e[0],
            e[1] - (
                0n/* +
                (tnglBals[e[0]] ? tnglBals[e[0]] : 0n) +
                (tnglBals2[e[0]] ? tnglBals2[e[0]] : 0n)*/
            )
        ]
    ).filter(e => e[1] > 0)
);

//console.log(Object.entries(airdropFix).reduce((p, c) => { return p + c[1]; }, 0n));
//console.log(Object.entries(airdropFix).sort((a, b) => parseInt(b[1] - a[1])));

let ftmTngl1Bals = {};
let ftmTngl2Bals = {};
let points1 = {
    marketMaking: {},
    airdropping: {}
};
let points2 = {
    marketMaking: {},
    airdropping: {}
};
let ftmTngl1LpBals = {};
let ftmTngl2LpBals = {};
let tnglV1FromLiquidity = {};
let tnglV2FromLiquidity = {};


/*console.log(
`${auditAddress}
Airdrop Calcuation (ARB, Snapshot Block 1874254)

TNGLv1 Balance: ${
    ftmTngl1Bals[auditAddress] ?
    fta(ftmTngl1Bals[auditAddress], 9) :
    fta(0, 9)
}
TNGLv2 Balance: ${
    ftmTngl2Bals[auditAddress] ?
    fta(ftmTngl2Bals[auditAddress], 9) :
    fta(0, 9)
}
TNGLv3 Balance: ${
    ftmTnglBals[auditAddress] ?
    fta(ftmTnglBals[auditAddress], 9) :
    fta(0, 9)
}
TNGL from V1 Market Making: ${
    points1["marketMaking"][auditAddress] ?
    fta(points1["marketMaking"][auditAddress] * totalRewards1 / 3n / totalMMPoints1, 9) :
    fta(0, 9)
}
TNGL from V2 Market Making: ${
    points2["marketMaking"][auditAddress] ?
    fta(points2["marketMaking"][auditAddress] * totalRewards2 / 3n / totalMMPoints2, 9) :
    fta(0, 9)
}
TNGL from V3 Market Making: ${
    points["marketMaking"][auditAddress] ?
    fta(points["marketMaking"][auditAddress] * totalRewards / 3n / totalMMPoints, 9) :
    fta(0, 9)
}
TNGL from V1 Airdropping: ${
    points1["airdropping"][auditAddress] ?
    fta(points1["airdropping"][auditAddress] * totalRewards1 / 3n / totalAPoints1, 9) :
    fta(0, 9)
}
TNGL from V2 Airdropping: ${
    points2["airdropping"][auditAddress] ?
    fta(points2["airdropping"][auditAddress] * totalRewards2 / 3n / totalAPoints2, 9) :
    fta(0, 9)
}
TNGL from V3 Airdropping: ${
    points["airdropping"][auditAddress] ?
    fta(points["airdropping"][auditAddress] * totalRewards / 3n / totalAPoints, 9) :
    fta(0, 9)
}
TNGL from V1 Staking: ${
    ftmTngl1LpBals[auditAddress] ?
    fta(ftmTngl1LpBals[auditAddress] * totalRewards1 / 3n / totalSPoints1, 9) :
    fta(0, 9)
}
TNGLv3 from V2 Staking: ${
    ftmTngl2LpBals[auditAddress] ?
    fta(ftmTngl2LpBals[auditAddress] * totalRewards2 / 3n / totalSPoints2, 9) :
    fta(0, 9)
}
TNGLv3 from V3 Staking: ${
    ftmTnglLpBals[auditAddress] ?
    fta(ftmTnglLpBals[auditAddress] * totalRewards / 3n / totalSPoints, 9) :
    fta(0, 9)
}
TNGL from V1 Liquidity: ${
    tnglV1FromLiquidity[auditAddress] ?
    fta(tnglV1FromLiquidity[auditAddress], 9) :
    fta(0, 9)
}
TNGL from V2 Liquidity: ${
    tnglV2FromLiquidity[auditAddress] ?
    fta(tnglV2FromLiquidity[auditAddress], 9) :
    fta(0, 9)
}
TNGL from V3 Liquidity: ${
    tnglV3FromLiquidity[auditAddress] ?
    fta(tnglV3FromLiquidity[auditAddress], 9) :
    fta(0, 9)
}
TNGL from pre-Tangle: ${
    fromPreTangle ?
    fta(fromPreTangle, 9) :
    fta(0, 9)
}

Total TNGL to Airdrop: ${
    auditAirdropTotal ?
    fta(auditAirdropTotal, 9) :
    fta(0, 9)
}
TNGL to Send: ${
    airdropFix[auditAddress] ?
    fta(airdropFix[auditAddress], 9) :
    fta(0, 9)
}`
);
*/
let interactors = Object.entries(airdropFix).map(e => e[0] + BigInt(e[1]).toString(16).padStart(64, '0'));
console.log(JSON.stringify(interactors));
let tree = [Object.entries(airdropFix).map(e => keccak256(e[0] + BigInt(e[1]).toString(16).padStart(64, '0')))];
/*console.log(tree[0].length);*/
for (let j = 0; j < Math.ceil(Math.log2(tree[0].length)); j++) {
    let newLayer = [];
    for (let i = 0; i < tree[j].length / 2; i++) {
        if (!tree[j][i * 2 + 1]) tree[j].push("0x" + "".padEnd(64, '0'));
        newLayer.push(keccak256(tree[j][i * 2] + tree[j][i * 2 + 1].substr(2)));
    }
    tree.push(newLayer);
}
console.log(JSON.stringify(tree));

/*let generateProof = (tree, index) => {
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
console.log(generateProof(tree, Object.keys(airdropFix).indexOf(auditAddress)), Object.keys(airdropFix).indexOf(auditAddress));
//console.log(keccak256("[REDACTED]61" + "[REDACTED]"))

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
let verifyLeaf = leaf => {
    let index = interactors.indexOf(leaf);
    let proof = generateProof(tree, index);
    return verifyProof(
        proof,
        tree[tree.length - 1][0],
        leaf,
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
        let randLeaf = randBits(32, 5) + randBits(32, 3).substr(2).padStart(64, '0');
        let randIndex = parseInt(Math.random() * tree[0].length);
        let randVerify = verifyProof(
            generateProof(tree, randIndex),
            tree[tree.length - 1][0],
            randLeaf,
            randIndex
        );
        if (randVerify[0]) {
            console.log(`random check: leaf ${randLeaf} verified`);
            return;
        } else {
            console.log(`random check: leaf ${randLeaf} unverified`);
        }
    }
    if (verifyLeaf(interactors[i])) {
        console.log(`leaf ${interactors[i]} verified`);
    } else {
        console.log(`leaf ${interactors[i]} unverified`);
        return;
    }
}
console.log("all addresses verified");*/
