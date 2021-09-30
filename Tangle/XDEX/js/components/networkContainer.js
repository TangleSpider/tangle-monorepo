import "./chainSelector.js";
import "./tokenSelector.js";
import "./amountSelector.js";
import "./approveButton.js";

Vue.component("network-container", {
    props: ["id"],
    data() {
        return {
            styleObject: {
                padding: "5px",
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                flexDirection: "column"
            }
        }
    },
    computed: {
        componentLabel: function () {
            return;
            return `networkContainer${this.id}`;
        }
    },
    template:
        `<div
            :style=styleObject
        >
            <chain-selector
                :id="id"
            >
            </chain-selector>
            <token-selector
                :id="id"
            >
            </token-selector>
            <amount-selector
                :id="id"
            >
            </amount-selector>
            <approve-button
                :id="id"
            >
            </approve-button>
            {{ componentLabel }}
        </div>`
});

export default {}
