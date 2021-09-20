Vue.component("slider-track", {
  data() {
    return {
      styleObject: {
        width: "100%",
        height: "7.5px",
        background: "#0003",
        borderRadius: "7.5px",
        position: "absolute",
        top: "calc(50% - 3.75px)"
      }
    }
  },
  template:
  `<div
    :style=styleObject
  >

  </div>`
});

export default {}
