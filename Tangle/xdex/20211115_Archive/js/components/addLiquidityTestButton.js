Vue.component("add-liquidity-test-button", {
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
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("chainChanged", () => {
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("accountsChanged", () => {
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
    },
    template:
        `<button
            :style=styleObject
            v-if=connected
            @mousedown=sendAddLiquidityTestRequest
        >
            sendAddLiquidityTestRequest
        </button>`,
    methods: {
        sendAddLiquidityTestRequest: function() {
            fetch("http://127.0.0.1:8080/xdexAddLiquidity", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    msgSender: "0xe1a811bDFb656Dc47a7262dbdE31071d9A916B1a",
                    data: {
                        tokens: [
                            "0x" + '1'.padStart(40, '0'),
                            "0x" + '11'.padStart(40, '0')
                        ],
                        chains: [
                            "0x" + 'f'.padStart(64, '0'),
                            "0x" + 'e'.padStart(64, '0')
                        ],
                        amountsDesired: [
                            "0x" + "2000000000".padStart(64, '0'),
                            "0x" + "1000000000".padStart(64, '0')
                        ],
                        amountsMin: [
                            "0x" + "1000000000".padStart(64, '0'),
                            "0x" + "1000000000".padStart(64, '0')
                        ]
                    }
                })
            })
            .then(response => { return response.json(); })
            .then(async response => {
                console.log(response);
                let err = await ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: response.paymentChain.replace(/(0x)0+/, "$1") }] });
                if (err) console.log(err);
                let blockData = await ethereum.request({ method: "eth_getBlockByNumber", params: [await ethereum.request({ method: "eth_blockNumber", params: []}), true]});
                let txParams = {
                    from: ethereum.selectedAddress,
                    to: response.TangleRelayerContract,
                    value: response.paymentAmount.replace(/(0x)0+/, "$1"),
                    data:
                        "0xd390f974" +
                        '0'.toString(16).padStart(64, '0') +
                        response.id.toString(16).padStart(64, '0')
                };
                let gasEstimate = await ethereum.request({
                    method: "eth_estimateGas",
                    params: [txParams]
                });
                let gasPrice = await ethereum.request({
                    method: "eth_gasPrice",
                    params: []
                });
                txParams.gas = gasEstimate;
                if (!blockData.baseFeePerGas) {
                    txParams.gasPrice = "0x" + parseInt(gasPrice).toString(16);
                } else {
                    txParams.maxPriorityFeePerGas = 0;
                    txParams.maxFeePerGas = 0;
                }
                let txHash = await ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [txParams],
                });
                console.log("Stake TX Sent, Tx Hash: ", txHash);
            });
        }
    }
});

export default {}
