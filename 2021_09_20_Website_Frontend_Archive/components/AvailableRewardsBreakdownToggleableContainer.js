import "./AvailableRewardsBreakdownKeys.js";
import "./AvailableRewardsBreakdownValues.js";

Vue.component("available-rewards-breakdown-toggleable-container", {
  data() {
    return {
      styleObject: {
        transition: "max-height cubic-bezier(0.4, 0, 0.2, 1) 0.35s",
        display: "flex",
        justifyContent: "space-between",
        overflow: "hidden",
        maxHeight: 0,
        marginTop: 2,
        width: 170
      }
    }
  },
  watch: {
    toggle: function (a, b) {
      this.styleObject.maxHeight = a ? 50 : 0;
    }
  },
  props: ["toggle"],
  template:
  `<div
    :style=styleObject
  >
    <available-rewards-breakdown-keys />
    <available-rewards-breakdown-values />
  </div>`
});

export default {}
