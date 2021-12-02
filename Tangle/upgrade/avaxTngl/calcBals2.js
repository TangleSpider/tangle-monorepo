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
let orbiBalsTotal = filteredOrbiBals.reduce((p, c) => {
    return p + c[1];
}, 0n);






let tnglBals = require("./calcBals.js");

let ftmTnglBals = require("../avaxTnglV3/getBalancesAtBlock")(5152854)[0];
let totalRewards = ftmTnglBals["0xAf1843657F00F8C048139B7103784fdeFC403702".toLowerCase()];
let ftmTnglLpBals = require("../avaxTnglV3Lp/getBalancesAtBlock2")(5152854);
let ftmTnglInLp = ftmTnglBals["0x7870B42206ed0bC0c53BdDeDCf684c96F70327c1".toLowerCase()];
let totalFtmTnglLpSupply = Object.values(ftmTnglLpBals).reduce((p, c) => { return c > 0 ? c + p : p; }, 0n);
let airdropFix = {};
notIncluded = [
    "0xe1a811bdfb656dc47a7262dbde31071d9a916b1a".toLowerCase(), // dev
    "0x7870B42206ed0bC0c53BdDeDCf684c96F70327c1".toLowerCase(), // liq
    "0x6E8c185F2Fb1C2Dd07B052d107c47F9287ea0AF2".toLowerCase(), // liqLock
    "0xAf1843657F00F8C048139B7103784fdeFC403702".toLowerCase(), // token
    "0x000000000000000000000000000000000000dead".toLowerCase()  // dead
];
Object.entries(ftmTnglBals).forEach(e => {
    if (notIncluded.indexOf(e[0]) == -1 && e[1] > 1100000000) {
        if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
        airdropFix[e[0]] += e[1];
    }
});
let tnglV3FromLiquidity = {};
Object.entries(ftmTnglLpBals).forEach(e => {
    if (!airdropFix[e[0]]) airdropFix[e[0]] = 0n;
    airdropFix[e[0]] += e[1] * 2n * ftmTnglInLp / totalFtmTnglLpSupply;
    if (!tnglV3FromLiquidity[e[0]]) tnglV3FromLiquidity[e[0]] = 0n;
    tnglV3FromLiquidity[e[0]] += e[1] * 2n * ftmTnglInLp / totalFtmTnglLpSupply;
});
airdropFix = Object.fromEntries(
    Object.entries(airdropFix).filter(
        e => notIncluded.indexOf(e[0]) == -1
    )
);
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


let auditAddress = "0x9A83542aA592249a12C5dd067f50EDcE63e29EcE".toLowerCase();
let auditAirdropTotal = airdropFix[auditAddress];
airdropFix = Object.fromEntries(
    Object.entries(airdropFix).map(e =>
        [e[0], tnglBals[e[0]] ? e[1] - tnglBals[e[0]] : e[1]]
    ).filter(e => e[1] > 0)
);


/*console.log(
`${auditAddress}
Airdrop Calcuation (AVAX, Snapshot Block 5152854)

TNGLv3 Balance: ${
    ftmTnglBals[auditAddress] ?
    fta(ftmTnglBals[auditAddress], 9) :
    fta(0, 9)
}
Market Making Points: ${
    points["marketMaking"][auditAddress] ?
    points["marketMaking"][auditAddress] :
    0
}
Airdropping Points: ${
    points["airdropping"][auditAddress] ?
    points["airdropping"][auditAddress] :
    0
}
Staking Points: ${
    ftmTnglLpBals[auditAddress] ?
    ftmTnglLpBals[auditAddress] :
    0
}
TNGLv3 from Market Making: ${
    points["marketMaking"][auditAddress] ?
    fta(points["marketMaking"][auditAddress] * totalRewards / 3n / totalMMPoints, 9) :
    fta(0, 9)
}
TNGLv3 from Airdropping: ${
    points["airdropping"][auditAddress] ?
    fta(points["airdropping"][auditAddress] * totalRewards / 3n / totalAPoints, 9) :
    fta(0, 9)
}
TNGLv3 from Staking: ${
    ftmTnglLpBals[auditAddress] ?
    fta(ftmTnglLpBals[auditAddress] * totalRewards / 3n / totalSPoints, 9) :
    fta(0, 9)
}
TNGLv3 Liquidity Balance: ${
    ftmTnglLpBals[auditAddress] ?
    fta(ftmTnglLpBals[auditAddress], 18) :
    fta(0, 9)
}
TNGLv3 from Liquidity: ${
    tnglV3FromLiquidity[auditAddress] ?
    fta(tnglV3FromLiquidity[auditAddress], 9) :
    fta(0, 9)
}

Total TNGL to Airdrop: ${
    auditAirdropTotal ?
    fta(auditAirdropTotal, 9) :
    fta(0, 9)
}
Sent in First Airdrop: ${
    tnglBals[auditAddress] ?
    fta(tnglBals[auditAddress], 9) :
    fta(0, 9)
}
Sent in Second Airdrop: ${
    airdropFix[auditAddress] ?
    fta(airdropFix[auditAddress], 9) :
    fta(0, 9)
}`
);

console.log(
`${JSON.stringify(Object.keys(airdropFix))}
${JSON.stringify(Object.values(airdropFix).map(a => a.toString()))}
${Object.entries(airdropFix).reduce((p, c) => { return c[1] + p; }, 0n)}`
);*/

module.exports = exports = airdropFix;
