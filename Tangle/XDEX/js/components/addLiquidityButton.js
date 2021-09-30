let chains = {
    P14: {
        rpcUrl: "http://127.0.0.1:8000",
        TangleRelayerContract: "0xA509CA4CF5E05B1e2178B1a9Ade08e05374C64af",
        chainId: "0xe"
    },
    P15: {
        rpcUrl: "http://127.0.0.1:8001",
        TangleRelayerContract: "0x3835Eb64fe65B7a3d85d110152ecaF547A919ca3",
        chainId: "0xf"
    }
};
Vue.component("add-liquidity-button", {
    data() {
        return {
            style: {
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
                background: "linear-gradient(rgb(155 155 155), transparent), linear-gradient(to left top, rgb(168 168 168 / 67%), transparent), linear-gradient(to right top, rgb(218 218 218), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
                backgroundBlendMode: "normal",
                transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
                cursor: "not-allowed",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                fontFamily: "sans-serif"
            },
            approvals: [false, false],
            chains: [null, null],
            tokens: [null, null],
            amounts: [null, null]
        }
    },
    mounted() {
        this.$root.$on("approvalChange", a => {
            this.approvals[a.id] = a.approved;
            this.change();
        });
        this.$root.$on("newChain", a => {
            this.chains[a.id] = "0x" + chains[a.chain].chainId.substr(2).padStart(64, '0');
        });
        this.$root.$on("newToken", a => {
            this.tokens[a.id] = a.token
        });
        this.$root.$on("newAmount", a => {
            this.amounts[a.id] = "0x" + BigInt(a.amount).toString(16).padStart(64, '0');
            //console.log(this.amounts[a.id]);
        });
    },
    template:
        `<button
            :style=style
            @mouseover=handleMouseOver
            @mouseout=handleMouseOut
            @mousedown=handleMouseDown
            @mouseup=handleMouseUp
            @touchend=handleMouseUp
            @touchcancel=handleMouseOut
        >
            Add Liquidity
        </button>`,
    methods: {
        handleMouseOver: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        handleMouseOut: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        handleMouseDown: async function() {
            if (!this.approvals.reduce((p, c) => { return p && c; })) return;
            this.style.boxShadow = "0px 0px 0 0 #8888";
            this.style.left = 5;
            this.style.top = 5;
            this.addLiquidity();
        },
        handleMouseUp: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        change: function() {
            let allApprovals = this.approvals.reduce((p, c) => { return p && c; });
            if (!allApprovals) {
                this.style.background = this.style.background = "linear-gradient(rgb(155 155 155), transparent), linear-gradient(to left top, rgb(168 168 168 / 67%), transparent), linear-gradient(to right top, rgb(218 218 218), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "not-allowed";
            } else {
                this.style.background = "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "pointer";
            }
        },
        addLiquidity: function() {
            fetch("http://127.0.0.1:8080/xdexAddLiquidity", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    msgSender: "0xe1a811bDFb656Dc47a7262dbdE31071d9A916B1a",
                    data: {
                        tokens: this.tokens,
                        chains: this.chains,
                        amountsDesired: this.amounts,
                        amountsMin: [
                            "0x" + "0".padStart(64, '0'),
                            "0x" + "0".padStart(64, '0')
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
                console.log(`addLiquidity XDEX payment sent, txHash ${txHash}`);
            });
        }
    }
});

export default {}
