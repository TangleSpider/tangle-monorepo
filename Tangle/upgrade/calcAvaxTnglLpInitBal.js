let blockNum = 5152854;
let devAddress = "0x6E8c185F2Fb1C2Dd07B052d107c47F9287ea0AF2".toLowerCase();
let getBalancesAtBlock = require("./avaxTnglV3/getBalancesAtBlock")
let lpAddress = "0x7870B42206ed0bC0c53BdDeDCf684c96F70327c1".toLowerCase();
let lpTokenBal = getBalancesAtBlock(blockNum)[lpAddress];
let getlpBalances = require("./avaxTnglV3Lp/getBalancesAtBlock");
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
