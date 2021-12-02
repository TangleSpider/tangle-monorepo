Vue.component("available-rewards-breakdown-keys", {
  data() {
    return {
      styleObject: {
        fontSize: 13,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "space-evenly",
        width: 80
      }
    }
  },
  template:
  `<div
    :style=styleObject
  >
    <div>Market Maker</div>
    <div>Distributor</div>
    <div>Staker</div>
  </div>`
});

export default {}
