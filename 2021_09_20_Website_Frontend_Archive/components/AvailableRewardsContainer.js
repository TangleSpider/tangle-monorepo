import "./AvailableRewardsLabel.js";
import "./AvailableRewardsAmount.js";
import "./AvailableRewardsClaimButton.js";
import "./AvailableRewardsBreakdownContainer.js";

Vue.component("available-rewards-container", {
  data() {
    return {
      styleObject: {
        marginTop: 10
      }
    }
  },
  template:
    `<div
      :style=styleObject
    >
      <available-rewards-label />
      <available-rewards-amount />
      <available-rewards-breakdown-container />
      <available-rewards-claim-button />
    </div>`
});

export default {}
