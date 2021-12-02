import "./components/walletInteractionButton.js";
import "./components/walletLabel.js";
import "./components/networkContainer.js";
import "./components/addLiquidityButton.js";
//import "./components/addLiquidityTestButton.js";

let app = new Vue({
    el: "#app",
    data() {
        return {
            styleObject0: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px"
            },
            styleObject1: {
                border: "1px solid rgb(187 35 60 / 13%)",
                borderRadius: "5px",
                padding: 10,
                boxShadow: "rgb(188 65 114 / 9%) 0px 0px 10px 0px",
                flexDirection: "row",
                display: "flex",
                gap: "10px"
            },
            networkContainers: [
                { key: 0 },
                { key: 1 },
            ]
        }
    },
    template:
        `<div
            :style=styleObject0
        >
            <wallet-interaction-button />
            <wallet-label />
            <div
                :style=styleObject1
            >
                <network-container
                    v-for="networkContainer in networkContainers"
                    v-key="networkContainer.key"
                    :id="networkContainer.key"
                >
                </network-container>
            </div>
            <add-liquidity-button />
        </div>`
});
