import "./StakingToggle.js";
import "./StakingToggleableContainer.js";

Vue.component("staking-container", {
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
  mounted() {
      this.$root.$on("closeEarningOptions", () => { this.toggle = false; });
  },
  template:
  `<div
    :style=styleObject
  >
    <staking-toggle
      :toggle=toggle
      @click.native="toggleContainer"
    />
    <staking-toggleable-container
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
