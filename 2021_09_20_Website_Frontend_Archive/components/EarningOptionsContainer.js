import "./EarningOptionsToggle.js";
import "./EarningOptionsToggleableContainer.js";

Vue.component("earning-options-container", {
  data() {
    return {
      styleObject: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 15
      },
      toggle: false
    }
  },
  template:
  `<div
    :style=styleObject
  >
    <earning-options-toggle
      :toggle=toggle
      @click.native="toggleContainer"
    />
    <earning-options-toggleable-container
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
