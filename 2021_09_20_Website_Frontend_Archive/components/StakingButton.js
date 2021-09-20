Vue.component("staking-button", {
  data() {
    return {
      styleObject: {
        webkitTapHighlightColor: "transparent",
        fontSize: 21,
        height: 53,
        width: 213,
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
      }
    }
  },
  template:
    `<div style="display:flex;justify-content:center">
      <button
        :style=styleObject
        @mouseout=handleMouseOut
        @mousedown=handleMouseDown
        @mouseup=handleMouseUp
        @touchstart=handleMouseDown
        @touchend=handleMouseUp
        @touchcancel=handleMouseUp
        @mouseover=handleMouseOver
      >
        Stake
      </button>
    </div>`,
  methods: {
    handleMouseDown: async function() {
      if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
      if (!this.$root.TNGL.state.sliderPosition) this.$root.TNGL.state.sliderPosition = 0;
      if (this.$root.TNGL.state.sliderPosition == 0 || this.$root.TNGL.state.liquidityBalance == 0) return;
      this.styleObject.boxShadow = "0px 0px 0 0 #8888";
      this.styleObject.left = 5;
      this.styleObject.top = 5;
      if (BigNumber(this.$root.TNGL.state.liquidityBalance)
          .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
          .dividedBy(BigNumber(100))
          .integerValue(3)
          .toString(16)
          .padStart(64, '0') == '0'.padStart(64, '0')) {
          console.log(
              "ERROR: 0-stake transaction",
              BigNumber(this.$root.TNGL.state.liquidityBalance)
              .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
              .dividedBy(BigNumber(100))
              .integerValue(3)
              .toString(16)
              .padStart(64, '0'),
              this.$root.TNGL.state.liquidityBalance,
              this.$root.TNGL.state.sliderPosition
          );
      }
      let blockData = await ethereum.request({ method: "eth_getBlockByNumber", params: [await ethereum.request({ method: "eth_blockNumber", params: []}), true]});
      let gasEstimate = await ethereum.request({
          method: "eth_estimateGas",
          params: [{
              from: ethereum.selectedAddress,
              to: this.$root.TNGL.state.tangleAddress,
              data: "0xa694fc3a" + BigNumber(this.$root.TNGL.state.liquidityBalance)
                  .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
                  .dividedBy(BigNumber(100))
                  .integerValue(3)
                  .toString(16)
                  .padStart(64, '0')
          }]
      });
      let gasPrice = await ethereum.request({
          method: "eth_gasPrice",
          params: []
      });
      let transactionParameters = {
          gas: gasEstimate,
          to: this.$root.TNGL.state.tangleAddress,
          from: ethereum.selectedAddress,
          data: "0xa694fc3a" + BigNumber(this.$root.TNGL.state.liquidityBalance)
              .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
              .dividedBy(BigNumber(100))
              .integerValue(3)
              .toString(16)
              .padStart(64, '0')
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
      console.log("Stake TX Sent, Tx Hash: ", txHash);
    },
    handleMouseUp: function() {
      this.styleObject.boxShadow = "5px 5px 0 0 #8882";
      this.styleObject.left = 0;
      this.styleObject.top = 0;
    },
    handleMouseOver: function() {
        if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) { this.styleObject.cursor = "no-drop"; return; }
        if (!this.$root.TNGL.state.sliderPosition) this.$root.TNGL.state.sliderPosition = 0;
        if (this.$root.TNGL.state.sliderPosition == 0 || this.$root.TNGL.state.liquidityBalance == 0) { this.styleObject.cursor = "no-drop"; return; }
        this.styleObject.cursor = "pointer";
    },
    handleMouseOut: function() {
        this.styleObject.cursor = "pointer";
        this.handleMouseUp();
    }
  }
});

export default {}
