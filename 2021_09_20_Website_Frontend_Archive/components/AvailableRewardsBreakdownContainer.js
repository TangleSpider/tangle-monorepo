import "./AvailableRewardsBreakdownToggle.js";
import "./AvailableRewardsBreakdownToggleableContainer.js";

Vue.component("available-rewards-breakdown-container", {
  data() {
    return {
      styleObject: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      toggle: false
    }
  },
  template:
  `<div
    :style=styleObject
  >
    <available-rewards-breakdown-toggle
      :toggle=toggle
      @click.native="toggleContainer"
    />
    <available-rewards-breakdown-toggleable-container
      :toggle=toggle
    />
  </div>`,
   methods: {
     toggleContainer: function() {
      this.toggle = !this.toggle;
     }
   }
});

export default {}
