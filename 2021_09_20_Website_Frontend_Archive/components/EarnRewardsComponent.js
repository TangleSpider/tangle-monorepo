import "./EarnRewardsButton.js";
import "./EarnRewardsContainer.js";

Vue.component("earn-rewards-component", {
  data() {
    return {
      containerVisible: false,
      styleObject: {
        display: "flex",
        justifyContent: "center"
      }
    }
  },
  template:
    `<div>
      <earn-rewards-button
        @click.native="toggleContainerVisibility"
        :containerVisible=containerVisible
      />
      <earn-rewards-container
        :style=styleObject
        :class="[containerVisible ? 'containerVisible' : 'containerHidden']"
      />
    </div>`,
  methods: {
    toggleContainerVisibility: function() {
     this.containerVisible = !this.containerVisible;
    }
  }
});

export default {}
