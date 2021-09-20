Vue.component("available-rewards-claim-button", {
  data() {
    return {
      styleObject: {
        webkitTapHighlightColor: "transparent",
        fontSize: 32,
        fontWeight: 600,
        height: 80,
        width: 320,
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
      }
    }
  },
  template:
    `<div style="display:flex;justify-content:center">
      <button
        :style=styleObject
        @mouseover=handleMouseOver
        @mouseout=handleMouseOut
        @mousedown=handleMouseDown
        @mouseup=handleMouseUp
        @touchend=handleMouseUp
        @touchcancel=handleMouseOut
      >
        Claim
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
      if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
      let blockData = await ethereum.request({ method: "eth_getBlockByNumber", params: [await ethereum.request({ method: "eth_blockNumber", params: []}), true]});
      let gasEstimate = await ethereum.request({
          method: "eth_estimateGas",
          params: [{
              from: ethereum.selectedAddress,
              to: this.$root.TNGL.state.tangleAddress,
              data: "0xc55897bf" + ethereum.selectedAddress.substr(2).padStart(64, '0')
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
          data: "0xc55897bf" + ethereum.selectedAddress.substr(2).padStart(64, '0'),
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
      console.log("Withdraw TX Sent, Tx Hash: ", txHash);
    },
    handleMouseUp: function() {
      this.styleObject.boxShadow = "5px 5px 0 0 #8882";
      this.styleObject.left = 0;
      this.styleObject.top = 0;
    }
  }
});

export default {}
