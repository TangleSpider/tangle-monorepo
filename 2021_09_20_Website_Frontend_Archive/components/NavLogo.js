Vue.component("nav-logo", {
  data() {
    return {
      styleObject: {
        height: 80,
        position: "absolute",
        marginTop: 14,
        marginLeft: 28
      }
    }
  },
  template:
    `<img
      :style=styleObject
      src="../web/images/tangleLogo_7_6_250.png"
    >
    </img>`
});

export default {}
