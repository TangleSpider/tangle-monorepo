Vue.component("body-1", {
    data() {
        return {
            styleObject0: {
                marginTop: 40,
                padding: "0 75"
            },
            styleObject1: {
                fontSize: 48,
                fontFamily: "math",
                fontWeight: 600,
                margin: "40 0"
            },
            styleObject2: {
                fontSize: 24,
                fontFamily: "system-ui"
            },
            styleObject3: {
                fontSize: 32,
                fontFamily: "math",
                marginTop: 40,
                fontWeight: 600
            },
            styleObject4: {
                marginTop: 20,
                display: "flex",
                justifyContent: "space-evenly"
            },
            styleObject5: {
                margin: "0 10 5 0"
            },
            styleObject6: {
                fontSize: 24,
                fontWeight: 100,
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                flexDirection: "column"
            },
            styleObject7: {
                margin: "20 0",
                fontSize: 16,
                fontFamily: "monospace"
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
        `<div
            :style=styleObject0
        >
            <div style="display: flex; justify-content: center; align-items: center">
                <a style="width: 250" href="https://tangle.co.in">
                    <img src="../../web/images/tangleLogo_7_6_250.png"></img>
                </a>
            </div>
            <div
                :style=styleObject1
            >
                The Meta Collection
            </div>
            <div
                :style=styleObject7
            >
                ETH-Meta Contract: 0xE25f7f27ce75c12613ff3415E450450fEA690fC3<br>
                AVAX-Meta Contract: 0xD94B630e42ce8C7f70F19EEA7CAe8e0e6d71bBB0<br>
                BSC-Meta Contract: 0xDE120065689efa8FFecabc9f622890e2D1E338CB<br>
                FTM-Meta Contract: 0x87bbA222642e6d5a09eaa90c03c2724757EF851c<br>
            </div>
            <div
                :style=styleObject2
            >
                Meta is a virtually infinite collection of NFTs made available on Ethereum, Binance Smart Chain, Avalanche, and Fantom.
                The NFTs in Meta are, simply put, EVM addresses.
                Every address on a chain is claimable as an NFT.
                Each chain has its own instance of the Meta collection, separate and not connected with the other Metas.
                For example, you could own the zero-address on Ethereum, but someone else could own the zero-address on BSC.
                <br><br>
                What makes this collection special is that Meta's Base URIs are hardcoded with the URL to
                    <a href="https://github.com/trustwallet/assets">Trust Wallet's Token Repository on GitHub</a>, which contains the logo and token information for a Trust Wallet verified token.<br>
                NFTs may have an arbitrary Base URI that describes what it contains, like an image.<br>
                *Disclaimer* Trust Wallet doesn't currently verify FTM or AVAX tokens, so the Base URI can be updated for Meta on these chains.<br>
                There is a function for the version of Meta on these chains to renounce being able to change the Base URI.<br>
                Bored Yacht Club, for instance, a popular and high-volume NFT collection, does not have a hardcoded Base URI.<br>
                The owner of Bored Yacht Club (currently address 0xaba7161a7fb69c88e16ed9f455ce62b791ee4d03) can change the Base URI at any time, and they may change or invalidate all NFT images at will.<br>
                An NFT collection with a hardcoded Base URI, especially one pointing to GitHub, is a very durable, and very safe NFT collection.
                <br><br>
                Trust Wallet also has a rigorous application process, so Meta address-NFTs that point towards a Trust Wallet verified token have a proven worth.<br>
                Buying a Meta address is laying claim to that address as an NFT.<br>
                Buying a Trust Wallet verified token's address on Meta is also laying claim to that token's logo and key information.
                <br><br>
                There is a 1% tax for sellers for any address, however, this tax can be evaded if the seller has at least 5,000,000 TangleV3.
            </div>
            <div
                :style=styleObject3
            >
                Overall Stats
            </div>
            <div
                :style=styleObject4
            >
                <div
                    v-for="statContainer in statContainers"
                >
                    <div
                        :style=styleObject5
                    >
                        {{ statContainer.header }}
                    </div>
                    <div style="font-weight: 600"> {{ statContainer.stat }} </div>
                </div>
            </div>
            <div
                :style=styleObject3
                style="margin-bottom: 40"
            >
                Interface
                <div
                    :style=styleObject6
                >
                    <div style="display: flex; justify-content: center">Claim Address</div>
                    <div style="display: flex; justify-content: center"><input v-model=input style="width: 400" type="text"></div>
                    <div style="display: flex; align-items: center; flex-direction: column">
                        <button v-if="connected" @click=handleClaim style="width: 150">Claim</button>
                        <button v-if="!connected" @click=connectWallet style="width: 150">Connect Wallet</button>
                        <div v-if="connected" style="margin-top: 5; font-size: 16"> {{ connectionLabel }} </div>
                    </div>
                </div>
            </div>
            <div style="margin-bottom: 80">Buying, Selling, Bidding, and automatic Trust Wallet information pulling (logo.png and info.json) to come soon.</div>
        </div>`,
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

export default {}
