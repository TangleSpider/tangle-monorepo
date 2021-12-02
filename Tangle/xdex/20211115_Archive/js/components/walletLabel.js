Vue.component("wallet-label", {
    data() {
        return {
            styleObject: {
                display: "flex",
                webkitTapHighlightColor: "transparent",
                fontSize: 14,
                fontWeight: 500,
                height: 40,
                width: 150,
                borderRadius: "10px",
                border: 0,
                color: "whitesmoke",
                marginTop: 10,
                boxShadow: "5px 5px 0 0 #8882",
                background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
                backgroundBlendMode: "normal",
                transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
                cursor: "pointer",
                position: "relative",
                fontFamily: "monospace",
                alignItems: "center",
                justifyContent: "center"
            },
            connected: false,
            chainId: null,
            selectedAddress: null
        }
    },
    mounted() {
        this.$root.$on("walletConnect", () => {
            this.connected = true;
            //console.log(ethereum.chainId, ethereum.selectedAddress);
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("chainChanged", () => {
            //console.log("chainChanged");
            //console.log(ethereum.chainId, ethereum.selectedAddress);
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("accountsChanged", () => {
            //console.log("accountsChanged");
            //console.log(ethereum.chainId, ethereum.selectedAddress);
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
    },
    computed: {
        walletLabel: function() {
            return `${this.getChainLabel(this.chainId)}: ${this.getSmallAddress(this.selectedAddress)}`;
        }
    },
    template:
        `<div
            :style=styleObject
            v-if=connected
        >
            {{ walletLabel }}
        </div>`,
    methods: {
        getChainLabel: chainId => {
            return {
                "0x1": "ETH",
                "0x38": "BSC",
                "0xa86a": "AVAX",
                "0xe": "P14",
                "0xf": "P15"
            }[chainId];
        },
        getSmallAddress: address => {
            return `${address.substr(0, 5)}...${address.substr(-3)}`;
        }
    }
});

export default {}
