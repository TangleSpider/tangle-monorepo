let calcPrices = require("./calcPrices.js");
let calcApys = require("./calcApys.js");
let getData = require("./getData.js");

let calcMetrics = () => {
    global.tangleMetrics = getData(global.tangleMetrics);
    if (global.tangleMetrics.initialized) {
        let [prices, pricesN] = calcPrices(global.tangleMetrics);
        let mCaps = Object.fromEntries(Object.entries(prices).slice(0, Object.values(prices).length - 1).map(a => { return [a[0].match(/[A-Z]+/)[0] + "_MCap", parseInt(a[1] * 1e9).toLocaleString()]; }));
        mCaps.TOTAL_MCap = Object.values(mCaps).reduce((c, p) => { return parseInt(c.replace ? c.replace(/,/g, '') : c) + parseInt(p.replace ? p.replace(/,/g, '') : p) }).toLocaleString();
        let apys = calcApys(global.tangleMetrics, prices, pricesN);
        return { prices: prices, mcaps: mCaps, apys: apys };
    } else {
        return { err: "tangleMetrics not initialized yet, wait one minute before resending request" };
    }
};

module.exports = exports = calcMetrics;
