Vue.component("connection-container", {
  data() {
    return {
      styleObject: {
      },
      connection: {
          address: null,
          chainId: null
      }
    }
  },
  mounted() {
    this.$root.$on("block", e => {
      this.connection.address = this.$root.TNGL.state.connection.address;
      this.connection.chainId = this.$root.TNGL.state.connection.chainId;
    });
  },
  template:
  `<div
    :style=styleObject
  >
    {{ connection | formatConnection }}
  </div>`,
  filters: {
      formatConnection: function(connectionObj) {
          if (!connectionObj.address || !connectionObj.chainId) return "Not Connected";
          let chainLabel;
          switch(connectionObj.chainId) {
              case 1: chainLabel = "ETH"; break;
              case 56: chainLabel = "BSC"; break;
          }
          return chainLabel + ": " + connectionObj.address.substr(0, 5) + "..." + connectionObj.address.substr(-3);
      }
  }
});

export default {}
