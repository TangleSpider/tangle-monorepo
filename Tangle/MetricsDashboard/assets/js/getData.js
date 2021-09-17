let updateData = require("./updateData.js");

let getData = () => {
    if (!Object.keys(global.tangleMetrics).length) {
        global.tangleMetrics = {
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
        updateData(global.tangleMetrics);
        return global.tangleMetrics;
    } else {
        if (parseInt(Date.now() / 1000) - global.tangleMetrics.lastUpdate >= 60 && !global.tangleMetrics.updating) {
            global.tangleMetrics.updating = true;
            updateData(global.tangleMetrics);
        }
        return global.tangleMetrics;
    }
};

module.exports = exports = getData;
