let encodePacked = (...args) => {
    return args.map(arg => arg.toString(16).match(/[0-9a-f]+$/i)[0].padStart(64, '0')).join("");
};
let sig = selector => {
    return "0x" + keccak256(selector).substr(0, 8);
};
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
let getApproved = async (chain, token, owner) => {
    let chainData = chains[chain];
    //console.log(`${sig("allowance(address,address)")}${encodePacked(owner, chainData.TangleRelayerContract)}`);
    return fetch(chainData.rpcUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{
                to: token,
                data: `${sig("allowance(address,address)")}${encodePacked(owner, chainData.TangleRelayerContract)}`
            },"latest"],
            id: 0
        })
    })
    .then(response => response.json())
    .then(response => {
        return response;
    });
};
let pendingTxs = {};
let getTxReceipt = async pendingTx => {
    let chainData = chains[pendingTx.chain];
    return fetch(chainData.rpcUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [pendingTx.hash],
            id: 0
        })
    }).
    then(response => response.json())
    .then(response => {
        return response;
    });
};
let pendingTxPoll = setInterval(() => {
    Object.values(pendingTxs).forEach(async pendingTx => {
        let txReceipt = await getTxReceipt(pendingTx);
        if (txReceipt && txReceipt.result) {
            delete pendingTxs[pendingTx.hash];
            pendingTx.callback();
        }
    });
}, 1000);

Vue.component("approve-button", {
    props: ["id"],
    data() {
        return {
            style: {
                webkitTapHighlightColor: "transparent",
                fontSize: 16,
                fontWeight: 500,
                height: 30,
                width: 100,
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
            approvable: true,
            approving: false,
            connected: false,
            chainId: null,
            selectedAddress: null,
            selectedChain: null,
            selectedToken: null,
            selectedAmount: null,
            approved: false
        }
    },
    mounted() {
        this.$root.$on("walletConnect", () => {
            this.connected = true;
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
            this.change();
        });
        this.$root.$on("chainChanged", () => {
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("accountsChanged", () => {
            [this.chainId, this.selectedAddress] = [ethereum.chainId, ethereum.selectedAddress];
        });
        this.$root.$on("newChain", a => {
            if (a.id == this.id) {
                this.selectedChain = a.chain;
                this.change();
            }
        });
        this.$root.$on("newToken", a => {
            if (a.id == this.id) {
                this.selectedToken = a.token;
                this.change();
            }
        });
        this.$root.$on("newAmount", a => {
            if (a.id == this.id) {
                this.selectedAmount = a.amount;
                this.change();
            }
        });
    },
    computed: {
        componentLabel: function () {
            if (this.approving) return "Approving...";
            if (this.approved) return "Approved";
            return "Approve";
            //return `approveButton${this.id}`;
        },
        computedStyle: function () {
            let computedStyle = {};
            Object.assign(computedStyle, this.style);
            return computedStyle;
        }
    },
    template:
        `<button
            v-if="connected && selectedChain && selectedToken && selectedAmount"
            :style=computedStyle
            @mouseover=handleMouseOver
            @mouseout=handleMouseOut
            @mousedown=handleMouseDown
            @mouseup=handleMouseUp
            @touchend=handleMouseUp
            @touchcancel=handleMouseOut
        >
            {{ componentLabel }}
        </button>`,
    methods: {
        handleMouseOver: function() {
            if (this.approved) return;
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
            if (this.approving || !this.approvable) return;
            if (this.approved) {
                await this.change();
                if (this.approved) return;
            }
            this.style.boxShadow = "0px 0px 0 0 #8888";
            this.style.left = 5;
            this.style.top = 5;
            this.approve();
        },
        handleMouseUp: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        approve: async function() {
            if (this.approving || !this.approvable) return;
            let chainData = chains[this.selectedChain];
            if (ethereum.chainId != chainData.chainId) {
                await new Promise(async (resolve, reject) => {
                    let err = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: chainData.chainId }]
                    }).
                    catch(err => {
                        console.log({ error: err });
                    });
                    if (err) reject(err);
                    let interval;
                    interval = setInterval(() => {
                        //console.log("chain change poll", ethereum.chainId, this.selectedChain);
                        if (ethereum.chainId == chainData.chainId) {
                            clearInterval(interval);
                            resolve(null);
                        }
                    }, 100);
                })
                .catch(err => {
                    console.log({ error: err });
                });
            }
            let txHash = await ethereum.request({
                method: "eth_sendTransaction",
                params: [{
                    from: this.selectedAddress,
                    to: this.selectedToken,
                    data: `${sig("approve(address,uint256)")}${encodePacked(chainData.TangleRelayerContract, BigInt(2) ** BigInt(256) - BigInt(1))}`
                }]
            })
            .catch(err => {
                console.log({ error: err });
                return null;
            });
            if (!txHash) return;
            console.log(`Approval transaction for token ${this.selectedToken} on chain ${this.selectedChain} sent, txHash: ${txHash}`);
            pendingTxs[txHash] = {
                chain: this.selectedChain,
                hash: txHash,
                callback: () => { this.approving = false; this.change() }
            };
            this.approving = true;
            this.style.background = "linear-gradient(rgb(255 159 174), transparent), linear-gradient(to left top, rgb(219 73 214 / 67%), transparent), linear-gradient(to right top, rgb(243 234 225), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
            this.style.cursor = "default";
        },
        change: async function() {
            if (!(this.connected && this.selectedChain && this.selectedToken && this.selectedAmount) || this.approving) {
                this.$root.$emit("approvalChange", {
                    id: this.id,
                    approved: false
                });
                return;
            }
            let approvedAmount = (await getApproved(this.selectedChain, this.selectedToken, this.selectedAddress)).result;
            if (approvedAmount == "0x") {
                this.approvable = false;
                this.style.background = "linear-gradient(rgb(155 155 155), transparent), linear-gradient(to left top, rgb(168 168 168 / 67%), transparent), linear-gradient(to right top, rgb(218 218 218), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "not-allowed";
                console.log({ error: `address ${this.selectedToken} on chain ${this.selectedChain} does not have an allowance function` });
                this.$root.$emit("approvalChange", {
                    id: this.id,
                    approved: false
                });
                return;
            }
            this.approvable = true;
            if (BigInt(approvedAmount) >= BigInt(this.selectedAmount)) {
                this.approving = false;
                this.approved = true;
                this.style.background = "linear-gradient(rgb(155 155 155), transparent), linear-gradient(to left top, rgb(168 168 168 / 67%), transparent), linear-gradient(to right top, rgb(218 218 218), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "default";
            } else {
                this.approving = false;
                this.approved = false;
                this.style.background = "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "pointer";
            }
            this.$root.$emit("approvalChange", {
                id: this.id,
                approved: this.approved
            });
        }
    }
});
