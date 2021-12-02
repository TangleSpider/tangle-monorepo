Vue.component("distributing-slider-range", {
  props: ["widthPercentage"],
  watch: {
    widthPercentage: function (a, b) {
      this.styleObject.width = a + '%';
    }
  },
  data() {
    return {
      styleObject: {
        width: "0%",
        height: "7.5px",
        borderRadius: "7.5px",
        background: "linear-gradient(rgb(255, 210, 201), transparent), linear-gradient(to left top, rgba(255, 146, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 252, 235), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
        position: "absolute",
        top: "calc(50% - 3.75px)"
      }
    }
  },
  template:
  `<div :style=styleObject />`
});

export default {}
