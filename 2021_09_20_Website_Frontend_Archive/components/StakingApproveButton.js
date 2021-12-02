Vue.component("staking-approve-button", {
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
        @mouseout=handleMouseUp
        @mousedown=handleMouseDown
        @mouseup=handleMouseUp
        @touchstart=handleMouseDown
        @touchend=handleMouseUp
        @touchcancel=handleMouseUp
      >
        Approve
      </button>
    </div>`,
  methods: {
    handleMouseDown: async function() {
      this.styleObject.boxShadow = "0px 0px 0 0 #8888";
      this.styleObject.left = 5;
      this.styleObject.top = 5;
      if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
      if (!this.$root.TNGL.state.sliderPosition) this.$root.TNGL.state.sliderPosition = 0;
      let blockData = await ethereum.request({ method: "eth_getBlockByNumber", params: [await ethereum.request({ method: "eth_blockNumber", params: []}), true]});
      let gasEstimate = await ethereum.request({
          method: "eth_estimateGas",
          params: [{
              from: ethereum.selectedAddress,
              to: this.$root.TNGL.state.liquidityAddress,
              data: "0x095ea7b3" + this.$root.TNGL.state.tangleAddress.substr(2).padStart(64, '0') + "".padStart(64, 'f')
          }]
      });
      let gasPrice = await ethereum.request({
          method: "eth_gasPrice",
          params: []
      });
      let transactionParameters = {
          gas: gasEstimate,
          to: this.$root.TNGL.state.liquidityAddress,
          from: ethereum.selectedAddress,
          data: "0x095ea7b3" + this.$root.TNGL.state.tangleAddress.substr(2).padStart(64, '0') + "".padStart(64, 'f')
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
      console.log("Approval TX Sent, Tx Hash: ", txHash);
    },
    handleMouseUp: function() {
      this.styleObject.boxShadow = "5px 5px 0 0 #8882";
      this.styleObject.left = 0;
      this.styleObject.top = 0;
    }
  }
});

export default {}
