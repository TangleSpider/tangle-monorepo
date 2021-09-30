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
                webkitTapHighlightColor: "transparent",
                fontSize: 16,
                fontWeight: 500,
                height: 40,
                width: 145,
                borderRadius: "10px",
                border: 0,
                color: "whitesmoke",
                marginTop: 10,
                boxShadow: "5px 5px 0 0 #8882",
                background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
                backgroundBlendMode: "normal",
                transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
                cursor: "pointer",
                position: "relative"
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
            Connect Wallet
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
