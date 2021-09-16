let calcPriceFromReserves = (N_T, N_$, reserveConfiguration) => {
    N_T = N_T.substr(2).match(/.{64}/g).slice(0, 2);
    N_$ = N_$.substr(2).match(/.{64}/g).slice(0, 2);
    if (reserveConfiguration & 1) N_T = N_T.reverse();
    if (reserveConfiguration & 2) N_$ = N_$.reverse();
    return BigInt("0x" + N_$[0]) * BigInt("0x" + N_T[0]) * BigInt(1e18) / (BigInt("0x" + N_$[1]) * BigInt("0x" + N_T[1]));
};

let calcPriceFromReservesN = (N_$, reserveConfiguration) => {
    N_$ = N_$.substr(2).match(/.{64}/g).slice(0, 2);
    if (reserveConfiguration & 1) N_$ = N_$.reverse();
    return BigInt("0x" + N_$[0]) * BigInt(1e27) / BigInt("0x" + N_$[1]);
};

let calcPrices = data => {
    let prices = {};
    [
        ["ETH", 0, 1e6],
        ["BSC", 3, 1e18],
        ["FTM", 0, 1e6],
        ["AVAX", 3, 1e6],
        ["ARB", 3, 1e6]
    ].forEach(a => {
        prices[a[0] + "_Price"] = parseInt(calcPriceFromReserves(
            data.reserves[a[0] + "_TNGL"],
            data.reserves[a[0] + "_USD"],
            a[1]
        ) / BigInt(a[2])) / 1e9;
    });
    prices.AVERAGE_Price = parseInt(Object.values(prices).reduce((c, p) => { return c + p }) * 1e9 / Object.values(prices).length) / 1e9;
    let pricesN = {};
    [
        ["ETH", 0, 1e6],
        ["BSC", 3, 1e18],
        ["FTM", 0, 1e6],
        ["AVAX", 3, 1e6],
        ["ARB", 3, 1e6]
    ].forEach(a => {
        pricesN[a[0] + "_Price"] = parseInt(calcPriceFromReservesN(
            data.reserves[a[0] + "_USD"],
            a[1]
        ) / BigInt(a[2])) / 1e9;
    });
    return [prices, pricesN];
};

export { calcPrices };
