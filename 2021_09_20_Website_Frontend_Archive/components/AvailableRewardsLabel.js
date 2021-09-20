Vue.component("available-rewards-label", {
  data() {
    return {
      styleObject: {
        fontSize: 30,
        display: "flex",
        justifyContent: "center"
      }
    }
  },
  template:
    `<div
      :style=styleObject
    >
      Available Rewards
    </div>`
});

export default {}
