let fs = require("fs");
let updateData = require("./updateData.js");

let getData = () => {
    let data;
    try {
        data = JSON.parse(fs.readFileSync("./data", "utf-8"));
    } catch (e) {}
    if (!data) {
        data = {
            updating: true,
            initialized: false,
            lastUpdate: parseInt(Date.now() / 1000),
            reserves: {
                ETH_TNGL: null,
                ETH_USD: null,
                BSC_TNGL: null,
                BSC_USD: null,
                FTM_TNGL: null,
                FTM_USD: null,
                AVAX_TNGL: null,
                AVAX_USD: null,
                ARB_TNGL: null,
                ARB_USD: null
            },
            ETH_TNGL: {
                rewardMax: [null, null, null],
                rewardsLastRewardChange: [null, null, null],
                rewardConst: [null, null, null],
                startTime: [null, null, null],
                timeFromInitToLastRewardChange: [null, null, null],
                totalRewardableEvents2: null,
                totalLPSupply: null,
                piecesPerUnit: null
            },
            BSC_TNGL: {
                rewardMax: [null, null, null],
                rewardsLastRewardChange: [null, null, null],
                rewardConst: [null, null, null],
                startTime: [null, null, null],
                timeFromInitToLastRewardChange: [null, null, null],
                totalRewardableEvents2: null,
                totalLPSupply: null,
                piecesPerUnit: null
            },
            FTM_TNGL: {
                rewardMax: [null, null, null],
                rewardsLastRewardChange: [null, null, null],
                rewardConst: [null, null, null],
                startTime: [null, null, null],
                timeFromInitToLastRewardChange: [null, null, null],
                totalRewardableEvents2: null,
                totalLPSupply: null,
                piecesPerUnit: null
            },
            AVAX_TNGL: {
                rewardMax: [null, null, null],
                rewardsLastRewardChange: [null, null, null],
                rewardConst: [null, null, null],
                startTime: [null, null, null],
                timeFromInitToLastRewardChange: [null, null, null],
                totalRewardableEvents2: null,
                totalLPSupply: null,
                piecesPerUnit: null
            },
            ARB_TNGL: {
                rewardMax: [null, null, null],
                rewardsLastRewardChange: [null, null, null],
                rewardConst: [null, null, null],
                startTime: [null, null, null],
                timeFromInitToLastRewardChange: [null, null, null],
                totalRewardableEvents2: null,
                totalLPSupply: null,
                piecesPerUnit: null
            }
        };
        fs.writeFileSync("./data", JSON.stringify(data));
        updateData(data);
        return data;
    } else {
        if (parseInt(Date.now() / 1000) - data.lastUpdate >= 60 && !data.updating) {
            data.updating = true;
            fs.writeFileSync("./data", JSON.stringify(data));
            updateData(data);
        }
        return data;
    }
};

module.exports = exports = getData;
