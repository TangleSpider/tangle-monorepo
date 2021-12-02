Vue.component("available-rewards-breakdown-values", {
  data() {
    return {
      styleObject: {
        fontSize: 13,
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: 80,
        marginLeft: 10
      },
      availableRewardsMarketMaker: "0",
      availableRewardsDistributor: "0",
      availableRewardsStaker: "0"
    }
  },
  mounted() {
    this.$root.$on("block", () => {
      let availableRewards = BigNumber(this.$root.TNGL.state.availableRewards);
      if (!availableRewards.eq(0)) {
        this.availableRewardsMarketMaker = BigNumber(this.$root.TNGL.state.availableRewardsMarketMaker).multipliedBy(BigNumber("10000")).div(BigNumber(availableRewards)).integerValue().toString();
        this.availableRewardsDistributor = BigNumber(this.$root.TNGL.state.availableRewardsDistributor).multipliedBy(BigNumber("10000")).div(BigNumber(availableRewards)).integerValue().toString();
        this.availableRewardsStaker = BigNumber(this.$root.TNGL.state.availableRewardsStaker).multipliedBy(BigNumber("10000")).div(BigNumber(availableRewards)).integerValue().toString();
      } else {
        this.availableRewardsMarketMaker = 0;
        this.availableRewardsDistributor = 0;
        this.availableRewardsStaker = 0;
      }
    });
  },
  template:
  `<div
    :style=styleObject
  >
    <div>{{ availableRewardsMarketMaker | format5DigitToPercentage }}%</div>
    <div>{{ availableRewardsDistributor | format5DigitToPercentage }}%</div>
    <div>{{ availableRewardsStaker | format5DigitToPercentage }}%</div>
  </div>`,
  filters: {
    format5DigitToPercentage: function(value) {
      return String(value)
        .padStart(3, '0')
        .replace(/(?=\d\d$)/, ".")
    }
  }
});

export default {}
