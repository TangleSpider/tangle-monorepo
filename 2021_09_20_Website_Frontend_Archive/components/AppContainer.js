import "./BannerImage.js";
import "./AvailableRewardsContainer.js";
import "./EarningOptionsContainer.js";
import "./WalletInteractionButton.js";

Vue.component("app-container", {
  data() {
    return {
      styleObject: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60 0",
        color: "#310",
        width: 375,
        overflow: "hidden"
      }
    }
  },
  template:
    `<div
      :style=styleObject
    >
        <banner-image />
        <wallet-interaction-button />
        <available-rewards-container />
        <earning-options-container />
    </div>`
});

export default {}
