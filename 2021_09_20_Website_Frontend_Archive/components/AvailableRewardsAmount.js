Vue.component("available-rewards-amount", {
  data() {
    return {
      styleObject: {
        fontSize: 20,
        fontFamily: "monospace",
        display: "flex",
        justifyContent: "center"
      },
      amount: 0
    }
  },
  mounted() {
    this.$root.$on("block", e => {
      this.amount = BigNumber(this.$root.TNGL.state.availableRewards);
    });
  },
  template:
    `<div
      :style=styleObject
    >
      {{ amount | formatTokenAmount }} TNGL
    </div>`
});

export default {}
