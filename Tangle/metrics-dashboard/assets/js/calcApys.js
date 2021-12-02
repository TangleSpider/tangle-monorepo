let calcApys = (data, prices, pricesN) => {
    let emissions = {};
    ["ETH", "BSC", "FTM", "AVAX", "ARB"].forEach(a => {
        let ppu = BigInt(data[a + "_TNGL"].piecesPerUnit);
        let a2 = BigInt(data[a + "_TNGL"].rewardMax[2]) / ppu;
        let b2 = BigInt(data[a + "_TNGL"].rewardsLastRewardChange[2]) / ppu;
        let c2 = BigInt(data[a + "_TNGL"].rewardConst[2]);
        let d2 = BigInt(data[a + "_TNGL"].startTime[2]);
        let e2 = BigInt(data[a + "_TNGL"].timeFromInitToLastRewardChange[2]);
        emissions[a] = c2 * (a2 - b2) / (c2 - d2 - e2 + BigInt(parseInt(Date.now() / 1000))) ** BigInt(2);
    });
    let investValue = 100;
    let Tangle = Object.fromEntries(Object.entries(prices).map(a => { return [a[0].match(/[^_]+/), BigInt(parseInt(investValue / 2 * 1e9 / a[1]))]; }));
    let N = Object.fromEntries(Object.entries(pricesN).map(a => { return [a[0].match(/[^_]+/), BigInt(parseInt(investValue / 2 * 1e18 / a[1]))]; }));
    let InvestValueSevenDayAPYs = {};
    ["ETH", "BSC", "FTM", "AVAX", "ARB"].forEach((a, i) => {
        let Liquidity = Tangle[a] * BigInt(data[a + "_TNGL"].totalLPSupply) / BigInt("0x" + data.reserves[a + "_TNGL"].substr(2).match(/.{64}/g).slice(0, 2)[[1, 0, 1, 0, 0][i]]);
        let EmissionsProportional = emissions[a] * Liquidity / (Liquidity + BigInt(data[a + "_TNGL"].totalRewardableEvents2));
        let SevenDayDollarReturn = parseInt(EmissionsProportional) / 1e9 * prices[a + "_Price"] * 604800;
        InvestValueSevenDayAPYs[a] = parseInt(((investValue + SevenDayDollarReturn) - investValue) / investValue * 365 / 7 * 10000) / 100 + "%";
    });
    return InvestValueSevenDayAPYs;
}

module.exports = exports = calcApys;
