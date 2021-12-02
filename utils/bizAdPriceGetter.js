{
    let getAdUnitTargetedBidDaysMinBid = adUnitId => {
        return new Promise((resolve, reject) => {
            let date = new Date();
            date = (1900 + date.getYear()) + '-' + (1 + date.getMonth()).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
            BGT.ajax(BGT.PATH_TO_WEB_ROOT + "ajax/getAdUnitTargetedBidDays.php", {
                data: {
                    adUnitId: adUnitId,
                    "targeting_params[]": ["c:2", "5:24"],
                    editModeId: null
                },
                success: e => {
                    resolve(e.data.targetedBidDays[date].minBid);
                }
            });
        });
    }

    let bidInfo = {};
    getAdUnitTargetedBidDaysMinBid(23)
    .then(minBid => { bidInfo.desktopHeader = minBid; return getAdUnitTargetedBidDaysMinBid(24) })
    .then(minBid => { bidInfo.desktopFooter = minBid; return getAdUnitTargetedBidDaysMinBid(25) })
    .then(minBid => { bidInfo.mobileHeader = minBid; return getAdUnitTargetedBidDaysMinBid(26) })
    .then(minBid => { bidInfo.mobileFooter = minBid; console.log(bidInfo) });

}
