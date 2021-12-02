import "./StakingContainer.js";
import "./MarketMakingContainer.js";
import "./DistributingContainer.js";

Vue.component("earning-options-toggleable-container", {
  data() {
    return {
      styleObject: {
        transition: "max-height cubic-bezier(0.04, 0.9, 0.49, 0.9) 0.15s",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: 0,
        width: 375,
        marginTop: 5
      }
    }
  },
  watch: {
    toggle: function (a, b) {
        if (!this.$root.earningOptionsMaxHeight) this.$root.earningOptionsMaxHeight = 0;
        if (a) this.$root.earningOptionsMaxHeight += 65;
        if (b) { this.$root.earningOptionsMaxHeight = 0; this.$root.$emit("closeEarningOptions"); }
        this.styleObject.maxHeight = this.$root.earningOptionsMaxHeight + "px";
    }
  },
  mounted() {
      this.$root.$on("earningOptionsResize", () => {
          this.styleObject.maxHeight = this.$root.earningOptionsMaxHeight + "px";
      });
  },
  props: ["toggle"],
  template:
  `<div
    :style=styleObject
  >
    <staking-container />
    <market-making-container />
    <distributing-container />
  </div>`
});

export default {}
