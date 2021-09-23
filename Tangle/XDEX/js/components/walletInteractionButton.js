async function requestAccounts() {

  let provider = await detectEthereumProvider();

  if (provider) {
    return await ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    console.log('Please install MetaMask!');
  }

}

Vue.component("wallet-interaction-button", {
    data() {
        return {
            styleObject: {
            },
            connected: false
        }
    },
    template:
        `<button
            :style=styleObject
            @mousedown=connectWallet
            v-if=!connected
        >
            connectWallet
        </button>`,
    methods: {
        connectWallet: async function() {
            let account = (await requestAccounts())[0];
            if (account) {
                if (!this.$root.TNGL) this.$root.TNGL = { state: {} };
                this.$root.$emit("walletConnect");
                this.connected = true;
            }
            ethereum.on("chainChanged", () => {
                this.$root.$emit("chainChanged");
            });
            ethereum.on("accountsChanged", () => {
                this.$root.$emit("accountsChanged");
            });
        }
    }
});

export default {}
