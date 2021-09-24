Vue.component("body-1", {
    data() {
        return {
            styleObject6: {
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                flexDirection: "column",
                alignItems: "center",
            },
            spanStyle: {
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
            },
            statContainers: [
                { header: "Total Address Purchases", stat: "N/A" },
                { header: "Total Value Transferred", stat: "N/A" },
                { header: "Total Addresses Claimed", stat: "N/A" }
            ],
            connected: false,
            connectionLabel: null,
            input: null,
            account: null,
            MetaAddress: null
        }
    },
    template:
        `<span :style=spanStyle>
            <section :style=styleObject6>
                <input v-model=input type="text">
                <button v-if="connected" @click=handleClaim style="width: 150">Claim</button>
                <button v-if="!connected" @click=connectWallet style="width: 150">Connect Wallet</button>
                <div v-if="connected" style="margin-top: 5; font-size: 16"> {{ connectionLabel }} </div>
            </section>
            <div>
                <div class="subheading-title-container">
                    <h3 class="subheading">Overall stats</h1>
                </div>
                <div class="heading-underline"></div>
            </div>
            <section style="display: flex; justifyContent: space-evenly; margin-top: 40">
                <div v-for="statContainer in statContainers">
                    <div style="margin: 0 10 5 0">
                        {{ statContainer.header }}
                    </div>
                    <div style="font-weight: 600"> {{ statContainer.stat }} </div>
                </div>
            </section>
        </span>`,
    methods: {
        handleChainChange: function() {
            window.location.reload();
        },
        handleAccountsChanged: async function() {
            this.account = (await this.requestAccounts())[0];
            this.connectionLabel = this.getChainLabel() + this.account.substr(0, 5) + "..." + this.account.substr(-3);
        },
        getMetaStats: async function() {
            this.statContainers[0].stat = parseInt(await ethereum.request({ method: "eth_call", params: [{ to: this.MetaAddress, data: "0xbaa9e531" }, "latest"] }));
            this.statContainers[1].stat = this.formatTokenAmount18(parseInt(await ethereum.request({ method: "eth_call", params: [{ to: this.MetaAddress, data: "0x5ea08620" }, "latest"] })));
            this.statContainers[2].stat = parseInt(await ethereum.request({ method: "eth_call", params: [{ to: this.MetaAddress, data: "0x18160ddd" }, "latest"] }));
        },
        connectWallet: async function() {
            if (!ethereum) return;
            this.account = (await this.requestAccounts())[0];
            ethereum.on("chainChanged", this.handleChainChange);
            ethereum.on("accountsChanged", this.handleAccountsChanged);
            this.setMetaAddress();
            this.getMetaStats();
            this.connected = true;
            this.connectionLabel = this.getChainLabel() + this.account.substr(0, 5) + "..." + this.account.substr(-3);
        },
        requestAccounts: async function() {
              let provider = await detectEthereumProvider();
              if (provider) {
                  return await ethereum.request({ method: 'eth_requestAccounts' });
              } else {
                  console.log('Please install MetaMask!');
              }
        },
        setMetaAddress: function() {
            switch (parseInt(ethereum.chainId)) {
                case 1: this.MetaAddress = "0xE25f7f27ce75c12613ff3415E450450fEA690fC3"; break;
                case 56: this.MetaAddress = "0xDE120065689efa8FFecabc9f622890e2D1E338CB"; break;
                case 14: this.MetaAddress = "0xaf984BFd3a45b5be66f2e551d5EBB7c59fC7C4f5"; break;
                case 250: this.MetaAddress = "0x87bbA222642e6d5a09eaa90c03c2724757EF851c"; break;
                case 43114: this.MetaAddress = "0xD94B630e42ce8C7f70F19EEA7CAe8e0e6d71bBB0"; break;
                default: console.log("UNKNOWN CHAIN: ", ethereum.chainId);
            }
        },
        getChainLabel: function() {
            let chainLabel;
            switch (parseInt(ethereum.chainId)) {
                case 1: chainLabel = "ETH: "; break;
                case 56: chainLabel = "BSC: "; break;
                case 14: chainLabel = ":^) "; break;
                case 250: chainLabel = "FTM: "; break;
                case 43114: chainLabel = "AVAX: "; break;
                default: console.log("UNKNOWN CHAIN: ", ethereum.chainId);
            }
            return chainLabel;
        },
        handleClaim: async function() {
            if (!this.input.match(/0x[0-9a-f]{40}/i)) return;
            let blockData = await ethereum.request({ method: "eth_getBlockByNumber", params: [await ethereum.request({ method: "eth_blockNumber", params: []}), true]});
            let gasEstimate = await ethereum.request({
                method: "eth_estimateGas",
                params: [{
                    from: this.account,
                    to: this.MetaAddress,
                    data: "0xee1fe2ad" + this.account.substr(2).padStart(64, '0') + this.input.substr(2).padStart(64, '0')
                }]
            });
            let gasPrice = await ethereum.request({
                method: "eth_gasPrice",
                params: []
            });
            let transactionParameters = {
                gas: gasEstimate,
                to: this.MetaAddress,
                from: this.account,
                data: "0xee1fe2ad" + this.account.substr(2).padStart(64, '0') + this.input.substr(2).padStart(64, '0')
            };
            if (!blockData.baseFeePerGas) {
                transactionParameters.gasPrice = "0x" + parseInt(gasPrice).toString(16);
            } else {
                transactionParameters.maxPriorityFeePerGas = 0;
                transactionParameters.maxFeePerGas = 0;
            }
            let txHash = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            console.log("Claim TX Sent, Tx Hash: ", txHash);
        },
        formatTokenAmount18: function(value) {
            if (isNaN(value)) value = 0;
            return value.toString(10)
              .padStart(19, '0')
              .replace(/\d{18}$/, ".$&")
              .replace(/(?=(\d{3})+(?!\d))(?=.*\.)(?!^)/g, ',')
        }
    }
});
