import "./components/walletInteractionButton.js";
import "./components/walletLabel.js";
import "./components/addLiquidityTestButton.js";

let app = new Vue({
  el: "#app",
  template:
    `<div>
      <wallet-interaction-button />
      <wallet-label />
      <add-liquidity-test-button />
    </div>`
});
