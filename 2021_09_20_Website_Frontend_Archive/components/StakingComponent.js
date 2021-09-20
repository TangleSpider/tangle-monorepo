import "./StakingContainerButton.js";
import "./StakingContainer.js";

Vue.component("staking-container", {
  data() {
    return {
      containerVisible: false,
      styleObject: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: 25,
        transition: "max-height cubic-bezier(0.4, 0, 0.2, 1) 0.35s",
        display: "flex",
        justifyContent: "space-between",
        padding: "0 10%",
        overflow: "hidden",
        maxHeight: this.containerVisible ? 300 : 0
      }
    }
  },
  template:
  `<div
    :style=styleObject
  >
    <staking-container-button
      :containerVisible=containerVisible
      @click.native="toggleContainerVisibility"
    />
    <staking-container
      :style=styleObject
    />
  </div>`,
  methods: {
    toggleContainerVisibility: function() {
     this.containerVisible = !this.containerVisible;
    }
  }
});

export default {}
