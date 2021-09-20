import "./DistributingToggle.js";
import "./DistributingToggleableContainer.js";

Vue.component("distributing-container", {
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
    <distributing-toggle
      :toggle=toggle
      @click.native="toggleContainer"
    />
    <distributing-toggleable-container
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
