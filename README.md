# Tangle
The Tangle Cryptocurrency Ecosystem

Roadmap:
- (Metamask app DONE, ConnectWallet on hold) ConnectWallet/Mobile App support 
- (DONE, anyone can request a new /biz/ ad for Tangle with a pull request in the media/bizAds folder) /biz/ ads
- (DONE) Metrics Dashboard 
- Upgrade Swap
    - This is a list of things to add to the final version of Tangle:
    - Upgradable contract. Upgrades must be time-delayed and can only be done by the upgrader. Address of the Upgrader can be changed to a governance contract in the future.
    - Fix the withdrawRewards bug. It is not critical, but severe enough to warrant an upgrade. changeRewardMax ID in argument 1 and 2 must be equal.
    - Add tracking and analytical variables: totalRewardsWithdrawn per category, event emissions for reward withdrawals include the reward category that is being withdrawn from. Maybe find a way to lump multiple reward withdrawals so that there's only 1 event emission. In general find ways to reduce the amount of event emissions in favor of fewer but more detailed emissions.
    - Donate function needs to emit an event.
    - Buying/selling Tangle (having it transferred to address A) should mark A as having received Tangle.
- Website/App updates:
    - Updated Roadmap and Whitepaper
    - (FIXED) Limit collected addresses to 250, some chains cannot handle 500 airdrops
    - Don't let people collect X addresses with distribution tool if they have less than X Tangle
    - Indicator for current LP staked vs (current LP staked + current LP unstaked) for staking slider 
    - Add Reward Breakdown %s for % of reward points in a category
- BSC <-> AVAX DEX-Bridge
- All other DEX-Bridges
- Update Meta UI and features
    - discord Meta mint/offer/bid/buy/withdraw tx bot announcements
    - offerTokenForSale
    - buyToken
    - enterBidForToken
    - withdrawBidForToken
    - acceptBidForToken
    - try to pull token logo from TrustWallet repo, if it exists, Meta NFTs with valid logos should be worth a bit
    - (?) add list of Trust Wallet verified addresses with logos to website, like cryptopunks has a list of images and if they are for sale, have bid, etc. to let people know what to buy 
- Forutsi (Decentralized, Zero-Consensus, Flexible, No-Restrictions Prediction Market)
- Hand out flyers
