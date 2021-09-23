Vue.component("wallet-label", {
    data() {
        return {
            styleObject: {
            },
            connected: false,
            chainId: null,
            selectedAddress: null
        }
    },
    mounted() {
        this.$root.$on("walletConnect", () => {
            this.connected = true;
            console.log(ethereum.chainId, ethereum.selectedAddress);
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("chainChanged", () => {
            console.log("chainChanged");
            console.log(ethereum.chainId, ethereum.selectedAddress);
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("accountsChanged", () => {
            console.log("accountsChanged");
            console.log(ethereum.chainId, ethereum.selectedAddress);
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
    },
    computed: {
        walletLabel: function() {
            return this.chainId + ':' + this.selectedAddress;
        }
    },
    template:
        `<div
            :style=styleObject
            v-if=connected
        >
            {{ walletLabel }}
        </div>`
});

export default {}
