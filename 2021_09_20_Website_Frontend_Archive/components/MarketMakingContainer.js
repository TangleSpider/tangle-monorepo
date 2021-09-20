import "./MarketMakingToggle.js";
import "./MarketMakingToggleableContainer.js";

Vue.component("market-making-container", {
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
    <market-making-toggle
      :toggle=toggle
      @click.native="toggleContainer"
    />
    <market-making-toggleable-container
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
