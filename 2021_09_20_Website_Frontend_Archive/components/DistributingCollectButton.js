Vue.component("distributing-collect-button", {
    data() {
        return {
            styleObject: {
                webkitTapHighlightColor: "transparent",
                fontSize: 21,
                height: 53,
                width: 310,
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
                marginBottom: 10
            },
            label: "Collect Addresses",
            addresses: [],
            blockNumQueue: [],
            queueProcessingRunning: false,
            _maxAddresses: 0,
            maxAddressesReached: false
        }
    },
    mounted() {
        setInterval(this.attemptBlockNumQueueProcessStart, 1000);
    },
  template:
    `<div style="display:flex;justify-content:center">
      <button
        :style=styleObject
        @mouseout=handleMouseUp
        @mousedown=handleMouseDown
        @mouseup=handleMouseUp
        @touchstart=handleMouseDown
        @touchend=handleMouseUp
        @touchcancel=handleMouseUp
      >
        {{ label }}
      </button>
    </div>`,
  methods: {
    handleMouseDown: async function() {
      this.styleObject.boxShadow = "0px 0px 0 0 #8888";
      this.styleObject.left = 5;
      this.styleObject.top = 5;
      //console.log(0);
      if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
      //console.log(1);
      if (!this.$root.TNGL.state.cropDustHelperState) this.$root.TNGL.state.cropDustHelperState = 0;
      if (this.$root.TNGL.state.cropDustHelperState == 0) {
          this.$root.TNGL.state.cropDustHelperState = 1;
          this.$root.$emit("cropDustHelperStateChange");
          this.collectAddresses(parseInt(this.$root.TNGL.state.distributingSliderPosition * 2.5));
          this.label = "Collecting Addresses (" + this.addresses.length + '/' + this._maxAddresses + ')';
      }
      if (this.$root.TNGL.state.cropDustHelperState == 2) {
          this.cropDustCollectedAddresses();
      }
    },
    handleMouseUp: function() {
          this.styleObject.boxShadow = "5px 5px 0 0 #8882";
          this.styleObject.left = 0;
          this.styleObject.top = 0;
    },
    cropDustCollectedAddresses: function() {
        try {
            ethereum.removeListener("message", this.processNewHead)
        } catch (err) {
            console.log("error in cropDustCollectedAddresses, removeListener: ", err);
        }
        this.$root.TNGL.state.cropDustHelperState = 3;
        //console.log("queueProcess stopped, fin");
        this.queueProcessRunning = false;
        this.blockQueue = [];
        ethereum.request({ method: "eth_blockNumber", params: []})
        .then(blockNumber => {
            ethereum.request({ method: "eth_getBlockByNumber", params: [blockNumber, true]})
            .then(blockData => {
                ethereum.request({
                    method: "eth_estimateGas",
                    params: [{
                        from: ethereum.selectedAddress,
                        to: this.$root.TNGL.state.tangleAddress,
                        data: "0xca6be7f1" + "20".padStart(64, '0') + JSON.parse(JSON.stringify(this.addresses)).length.toString(16).padStart(64, '0') + JSON.parse(JSON.stringify(this.addresses)).map(a => a.substr(2).padStart(64, '0')).join('')
                    }]
                })
                .then(gasEstimate => {
                    ethereum.request({ method: "eth_gasPrice", params: [] })
                    .then(gasPrice => {
                        let transactionParameters = {
                            gas: gasEstimate,
                            to: this.$root.TNGL.state.tangleAddress,
                            from: ethereum.selectedAddress,
                            data: "0xca6be7f1" + "20".padStart(64, '0') + JSON.parse(JSON.stringify(this.addresses)).length.toString(16).padStart(64, '0') + JSON.parse(JSON.stringify(this.addresses)).map(a => a.substr(2).padStart(64, '0')).join('')
                        };
                        if (!blockData.baseFeePerGas) {
                            transactionParameters.gasPrice = "0x" + parseInt(gasPrice).toString(16);
                        } else {
                            transactionParameters.maxPriorityFeePerGas = 0;
                            transactionParameters.maxFeePerGas = 0;
                        }
                        ethereum.request({ method: 'eth_sendTransaction', params: [transactionParameters] })
                        .then(txHash => {
                            console.log("Airdrop TX Sent, Tx Hash: ", txHash);
                            this.$root.TNGL.state.cropDustHelperState = 0
                            this.label = "Collect Addresses";
                        })
                        .catch(err => {
                            console.log(err);
                            this.$root.TNGL.state.cropDustHelperState = 0
                            this.label = "Collect Addresses";
                        });
                    });
                })
                .catch(err => {
                    console.log("error in cropDustCollectedAddresses, sendTransaction: ", err);
                });
            });
        });
    },
    processBlockTxByIndex: function(blockNum, txIndex) {
        if (this.$root.TNGL.state.cropDustHelperState == 3) return;
        let goNext = () => {
            //console.log("sN-" + blockNum + '-' + txIndex);
            if (txIndex > 0) this.processBlockTxByIndex(blockNum, txIndex - 1);
            if (txIndex == 0) {
                this.blockNumQueue.shift();
                if (this.blockNumQueue.length) {
                    //console.log("moving to random block in queue");
                    if (this.blockNumQueue.length > 1) {
                        let tmp;
                        tmp = this.blockNumQueue[0];
                        let rnd = parseInt(Math.random() * (this.blockNumQueue.length - 1)) + 1;
                        this.blockNumQueue[0] = this.blockNumQueue[rnd];
                        this.blockNumQueue[rnd] - tmp;
                    }
                    this.getBlockNumTxCount(this.blockNumQueue[0]);
                } else {
                    //console.log("queueProcess stopped, out");
                    this.queueProcessRunning = false;
                }
            }
        };
        //console.log("processing blockNum " + blockNum + " by txIndex " + txIndex);
        ethereum.request({ method: "eth_getTransactionByBlockNumberAndIndex", params: [blockNum, "0x" + txIndex.toString(16)]})
        .then(tx => {
            if (tx && this.addresses.indexOf(tx.from) == -1) {
                //console.log("s0-" + blockNum + '-' + txIndex + ": valid");
                ethereum.request({ method: "eth_getBalance", params: [tx.from, "latest"] })
                .then(bal => {
                    if (bal > 5e17) {
                        //console.log("s1-" + blockNum + '-' + txIndex + ": valid");
                        ethereum.request({ method: "eth_getCode", params: [tx.from, "latest"] })
                        .then(code => {
                            if (code == "0x") {
                                //console.log("s2-" + blockNum + '-' + txIndex + ": valid");
                                ethereum.request({ method: "eth_call", params: [{
                                    to: this.$root.TNGL.state.tangleAddress,
                                    data: "0x22d5ba98" + tx.from.substr(2).padStart(64, '0')
                                }, "latest"] })
                                .then(hasReceivedPieces => {
                                    if (!parseInt(hasReceivedPieces)) {
                                        //console.log("s3-" + blockNum + '-' + txIndex + ": valid");
                                        fetch(window.location.href.match(/https?:\/\/.*?\//)[0] + "addressCheck", {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify({
                                                address: tx.from,
                                                chain: parseInt(ethereum.chainId)
                                            }),
                                        })
                                        .then(response => response.json())
                                        .then(a => {
                                            if (a && a.usable) {
                                                //console.log("sF-" + blockNum + '-' + txIndex + ": valid");
                                                this.addresses.push(tx.from);
                                                this.label = "Collecting Addresses (" + this.addresses.length + '/' + this._maxAddresses + ')';
                                                if (this.addresses.length >= this._maxAddresses) {
                                                    this.cropDustCollectedAddresses();
                                                } else {
                                                    goNext();
                                                }
                                            } else {
                                                //console.log("sF-" + blockNum + '-' + txIndex + ": invalid");
                                                goNext();
                                            }
                                        });
                                    } else {
                                        //console.log("s3-" + blockNum + '-' + txIndex + ": invalid");
                                        goNext();
                                    }
                                });
                            } else {
                                //console.log("s2-" + blockNum + '-' + txIndex + ": invalid");
                                goNext();
                            }
                        });
                    } else {
                        //console.log("s1-" + blockNum + '-' + txIndex + ": invalid");
                        goNext();
                    }
                });
            } else {
                //console.log("s0-" + blockNum + '-' + txIndex + ": invalid");
                goNext();
            }
        }).catch(err => {
            console.log("error caught in processBlockTxByIndex: ", err);
        });
    },
    getBlockNumTxCount: function(blockNum) {
        ethereum.request({ method: "eth_getBlockTransactionCountByNumber", params: [blockNum]})
        .then(txCount => {
            this.processBlockTxByIndex(blockNum, txCount - 1);
        });
    },
    processNewHead: function (e) {
        if (!e.data.result.number || this.blockNumQueue.length > 10) return;
        this.blockNumQueue.push(e.data.result.number);
        //console.log("new head push to queue, new blockQueue length", this.blockNumQueue.length);
    },
    attemptBlockNumQueueProcessStart: function () {
        if (this.queueProcessRunning || !this.$root.TNGL || !(this.$root.TNGL.state.cropDustHelperState == 1 || this.$root.TNGL.state.cropDustHelperState == 2) || !this.blockNumQueue.length) return;
        //console.log("starting blockNumQueueProcess");
        this.queueProcessRunning = true;
        this.$root.TNGL.state.cropDustHelperState = 2;
        this.getBlockNumTxCount(this.blockNumQueue[0]);
    },
    collectAddresses: function (maxAddresses) {
        if (maxAddresses > 250) {
             //console.log("ERR: collectAddresses is limited to a max of 500 addresses, { " + maxAddresses + " } was attempted");
             return;
        }
        this._maxAddresses = maxAddresses;
        this.addresses = [];
        ethereum.on("message", this.processNewHead);
    }
  }
});

export default {}
