Vue.component("distributing-slider-handle", {
  props: ["widthPercentage"],
  watch: {
    widthPercentage: function (a, b) {
      this.styleObject.left = "calc(" + a + "% - 6.75px)";
    }
  },
  data() {
    return {
      styleObject: {
        width: "12.5px",
        height: "12.5px",
        borderRadius: "12.5px",
        background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
        position: "absolute",
        left: "calc(-6.75px + 0%)",
        top: "calc(50% - 6.75px)"
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
