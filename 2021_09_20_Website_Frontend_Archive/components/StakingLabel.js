Vue.component("staking-label", {
  data() {
    return {
      styleObject: {
        fontSize: 18,
        fontFamily: "monospace",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
      },
      amount: 0,
      chainLiquidityAddUrl: null
    }
  },
  mounted() {
    this.$root.$on("block", e => {
        if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
        if (!this.$root.TNGL.state.currentlyStaked) this.$root.TNGL.state.currentlyStaked = 0;
        this.amount = this.$root.TNGL.state.liquidityBalance ? BigNumber(this.$root.TNGL.state.liquidityBalance)
            .plus(BigNumber(this.$root.TNGL.state.currentlyStaked))
            .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
            .dividedBy(BigNumber(100))
            .integerValue(3) : 0;
    });
    this.$root.$on("stakingSliderChange", e => {
        if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
        if (!this.$root.TNGL.state.currentlyStaked) this.$root.TNGL.state.currentlyStaked = 0;
        this.amount = this.$root.TNGL.state.liquidityBalance ? BigNumber(this.$root.TNGL.state.liquidityBalance)
            .plus(BigNumber(this.$root.TNGL.state.currentlyStaked))
            .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
            .dividedBy(BigNumber(100))
            .integerValue(3) : 0;
    });
  },
  computed: {
      getCurrentChainLabel: function () {
          let chainLabel = "";
          switch (parseInt(ethereum.chainId)) {
              case 1: chainLabel = "ETH"; break;
              case 56: chainLabel = "BNB"; break;
              case 14: chainLabel = ":^)"; break;
              case 250: chainLabel = "FTM"; break;
              case 43114: chainLabel = "AVAX"; break;
              case 42161: chainLabel = "AETH"; break;
              default: chainLabel = parseInt(ethereum.chainId);
          }
          this.chainLabel = "TNGLv3:" + chainLabel + " LP";
          return this.chainLabel
      },
      getCurrentLiquidityAddUrl: function () {
          switch (parseInt(ethereum.chainId)) {
              case 1: return "https://app.uniswap.org/#/add/v2/ETH/0xc7827a6ccc51176a986f05ec8572244aece6bf2e";
              case 56: return "https://pancakeswap.finance/add/0xa536f6459e104666b2c08118f5a835de311d8e47/0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
              case 250: return "https://spookyswap.finance/add/FTM/0x2F96f61a027B5101E966EC1bA75B78f353259Fb3";
              case 43114: return "https://app.pangolin.exchange/#/add/0xaf1843657f00f8c048139b7103784fdefc403702/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
              case 42161: return "https://app.sushi.com/add/ETH/0x69F012e4dD7C2dd75cd02CCb239E42642647e0cD";
              default: return "";
          }
      }
  },
  template:
  `<div
    :style=styleObject
  >
    <span> {{ amount | formatTokenAmount18 }} </span><a :href="getCurrentLiquidityAddUrl" style="margin-left:5px" target="_blank"> {{ getCurrentChainLabel }} </a>
  </div>`,
  filters: {
      formatTokenAmount18: function (value) {
          if (isNaN(value)) value = 0;
          return value.toString(10)
            .padStart(19, '0')
            .replace(/\d{18}$/, ".$&")
            .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',');
      }
  }
});

export default {}
