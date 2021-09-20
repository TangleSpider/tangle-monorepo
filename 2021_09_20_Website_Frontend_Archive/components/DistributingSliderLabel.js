Vue.component("distributing-label", {
  data() {
    return {
      styleObject: {
        fontSize: 20,
        fontFamily: "monospace",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      },
      amount: 0
    }
  },
  mounted() {
    this.$root.$on("distributingSliderChange", e => {
        if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
        this.amount = parseInt(this.$root.TNGL.state.distributingSliderPosition * 2.5);
    });
  },
  template:
  `<div
    :style=styleObject
  >
    Airdrop to {{ amount }} Wallets
  </div>`
});

export default {}
