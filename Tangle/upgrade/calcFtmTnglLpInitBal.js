let blockNum = 18195967;
let devAddress = "0xb6d0ae90e956e7ac1f86b925dd58ab99c6a957a9";
let getBalancesAtBlock = require("./ftmTnglV3/getBalancesAtBlock")
let lpAddress = "0xcff6c70e174a4b8c020a81cebb75ce131c285916";
let lpTokenBal = getBalancesAtBlock(blockNum)[lpAddress];
let getlpBalances = require("./ftmTnglV3Lp/getBalancesAtBlock");
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
