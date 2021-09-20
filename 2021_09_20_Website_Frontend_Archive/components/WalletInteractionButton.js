let addressObtained = false;

async function getChainId() {

  let provider = await detectEthereumProvider();

  if (provider) {
    return await ethereum.request({ method: 'eth_chainId' });
  } else {
    console.log('Please install MetaMask!');
  }

}

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
                fontSize: 25,
                height: 55,
                width: 230,
                borderRadius: "10px",
                border: 0,
                top: 0,
                left: 0,
                boxShadow: "5px 5px 0 0 #8882",
                background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
                color: "whitesmoke",
                backgroundBlendMode: "normal",
                transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
                cursor: "pointer",
                position: "relative",
                marginTop: 10,
                marginBottom: 10,
                zIndex: 1
            },
            styleObject2: {
                height: 55,
                display: "flex",
                justifyContent: "center",
                position: "relative",
                width: 230,
                top: -30,
            },
            walletLabel: null
        }
    },
  template:
    `<div style="display:flex;flex-direction:column;justify-content:center">
      <button
        :style=styleObject
        @mouseover=handleMouseOver
        @mouseout=handleMouseOut
        @mousedown=handleMouseDown
        @mouseup=handleMouseUp
        @touchstart=handleMouseDown
        @touchend=handleMouseUp
        @touchcancel=handleMouseOut
      >
        {{ walletLabel ? walletLabel : "Connect Wallet" }}
      </button>
    </div>`,
    methods: {
        handleMouseOver: function() {
            this.styleObject.boxShadow = "5px 5px 0 0 #8882";
            this.styleObject.left = 0;
            this.styleObject.top = 0;
        },
        handleMouseOut: function() {
            this.styleObject.boxShadow = "5px 5px 0 0 #8882";
            this.styleObject.left = 0;
            this.styleObject.top = 0;
        },
        handleMouseDown: async function() {
            this.styleObject.boxShadow = "0px 0px 0 0 #8888";
            this.styleObject.left = 5;
            this.styleObject.top = 5;
            this.connectWallet();
        },
        handleMouseUp: function() {
            this.styleObject.boxShadow = "5px 5px 0 0 #8882";
            this.styleObject.left = 0;
            this.styleObject.top = 0;
        },
        connectWallet: async function() {
            let account = (await requestAccounts())[0];
            let chainId = parseInt(await getChainId());
            let tangleAddress;
            let liquidityAddress;
            switch (chainId) {
                case 1:
                    tangleAddress = "0xC7827a6CCc51176A986F05Ec8572244aecE6bf2e";
                    liquidityAddress = "0x1A610A2AE3eb219797A471aC62904e1269Ab89B2";
                    this.walletLabel = "ETH: ";
                    break;
                case 56:
                    tangleAddress = "0xA536F6459E104666b2C08118F5A835De311D8E47";
                    liquidityAddress = "0x16A7e5c3C928618d9Ff554Cf9945F2087Bbe8db5";
                    this.walletLabel = "BSC: ";
                    break;
                case 14:
                    tangleAddress = "0x3835Eb64fe65B7a3d85d110152ecaF547A919ca3";
                    liquidityAddress = "0x2613Bd29201cF0A6c1A765583B9798b344Df4c66";
                    this.walletLabel = ":^) ";
                    break;
                case 250:
                    tangleAddress = "0x2F96f61a027B5101E966EC1bA75B78f353259Fb3";
                    liquidityAddress = "0xcff6c70e174a4b8c020a81cebb75ce131c285916";
                    this.walletLabel = "FTM: ";
                    break;
                case 43114:
                    tangleAddress = "0xAf1843657F00F8C048139B7103784fdeFC403702";
                    liquidityAddress = "0x7870b42206ed0bc0c53bddedcf684c96f70327c1";
                    this.walletLabel = "AVAX: ";
                    break;
                case 42161:
                    tangleAddress = "0x69F012e4dD7C2dd75cd02CCb239E42642647e0cD";
                    liquidityAddress = "0xb3b030f1494dcf1872152460c0e9c8b9ab74b39b";
                    this.walletLabel = "ARB: ";
                    break;
              default: console.log("UNKNOWN CHAIN: ", chainId);
            }
            this.walletLabel += account.substr(0, 5) + "..." + account.substr(-3);
            this.styleObject2.top = 0;
            if (account && !addressObtained && tangleAddress) {
                if (!this.$root.TNGL)
                    this.$root.TNGL = { state: {} };
                let availableRewardData;
                try {
                    if (ethereum) {
                        //console.log({ method: "eth_call", params: [{ to: tangleAddress, data: "0xfd9ff94c" + account.substr(2).padStart(64, '0') }, "latest"] });
                        availableRewardData = await ethereum.request({ method: "eth_call", params: [{ to: tangleAddress, data: "0xfd9ff94c" + account.substr(2).padStart(64, '0') }, "latest"] });
                    }
                } catch (err) {
                    alert(JSON.stringify(err));
                }
                this.$root.TNGL.state.connection = {
                    address: account,
                    chainId: chainId
                };
                this.$root.TNGL.state.tangleAddress = tangleAddress;
                this.$root.TNGL.state.liquidityAddress = liquidityAddress;
                this.$root.TNGL.state.availableRewards = "0x" + availableRewardData.substr(2).match(/.{64}/g)[3];
                this.$root.TNGL.state.availableRewardsMarketMaker = "0x" + availableRewardData.substr(2).match(/.{64}/g)[0];
                this.$root.TNGL.state.availableRewardsDistributor = "0x" + availableRewardData.substr(2).match(/.{64}/g)[1];
                this.$root.TNGL.state.availableRewardsStaker = "0x" + availableRewardData.substr(2).match(/.{64}/g)[2];
                this.$root.TNGL.state.liquidityBalance = await ethereum.request({ method: "eth_call", params: [{ to: liquidityAddress, data: "0x70a08231" + account.substr(2).padStart(64, '0') }, "latest"] });
                this.$root.TNGL.state.currentlyStaked = await ethereum.request({ method: "eth_call", params: [{ to: tangleAddress, data: "0xf6b5fc2e" + account.substr(2).padStart(64, '0') + '2'.padStart(64, '0') }, "latest"] });
                this.$root.$emit("block");
                await ethereum.request({ method: "eth_subscribe", params: ["newHeads", {}]  });
                ethereum.on("message", async e => {
                    try {
                        let availableRewardData = await ethereum.request({ method: "eth_call", params: [{ to: tangleAddress, data: "0xfd9ff94c" + account.substr(2).padStart(64, '0') }, "latest"] });
                        this.$root.TNGL.state.availableRewards = "0x" + availableRewardData.substr(2).match(/.{64}/g)[3];
                        this.$root.TNGL.state.availableRewardsMarketMaker = "0x" + availableRewardData.substr(2).match(/.{64}/g)[0];
                        this.$root.TNGL.state.availableRewardsDistributor = "0x" + availableRewardData.substr(2).match(/.{64}/g)[1];
                        this.$root.TNGL.state.availableRewardsStaker = "0x" + availableRewardData.substr(2).match(/.{64}/g)[2];
                        this.$root.TNGL.state.liquidityBalance = await ethereum.request({ method: "eth_call", params: [{ to: liquidityAddress, data: "0x70a08231" + account.substr(2).padStart(64, '0') }, "latest"] });
                        this.$root.TNGL.state.currentlyStaked = await ethereum.request({ method: "eth_call", params: [{ to: tangleAddress, data: "0xf6b5fc2e" + account.substr(2).padStart(64, '0') + '2'.padStart(64, '0') }, "latest"] });
                        this.$root.$emit("block");
                    } catch { }
                })
                addressObtained = true;
            }
        }
    }
});

export default {}
