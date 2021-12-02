let blockNum = 11444681;
let devAddress = "0x4c0314a5658003c581e5dc4b120e1323885d738b";
let getBalancesAtBlock = require("./bscTnglV3/getBalancesAtBlock")
let lpAddress = "0x16a7e5c3c928618d9ff554cf9945f2087bbe8db5";
let lpTokenBal = getBalancesAtBlock(blockNum)[lpAddress];
let getlpBalances = require("./bscTnglV3Lp/getBalancesAtBlock");
let lpBalances = getlpBalances(blockNum);
let lpTotalSupply = (
     Object.values(lpBalances)
    .filter(b => b > 0)
    .reduce((p, c) => { return p + c; })
);
console.log(lpTokenBal, lpBalances[devAddress], lpTotalSupply);
let devTokensInLp = lpTokenBal * lpBalances[devAddress] / lpTotalSupply;
let initLpTokens = devTokensInLp;
console.log(initLpTokens);
