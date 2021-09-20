Vue.component("slider-tooltip", {
  props: ["widthPercentage"],
  watch: {
    widthPercentage: function (a, b) {
      this.widthPercentage = a;
      this.styleObject.left = "calc(" + this.widthPercentage + "% - 28.75px)";
    }
  },
  data() {
    return {
      styleObject: {
        width: 57.5,
        fontSize: 17.5,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        left: -28.75,
        background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
        transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
        color: "whitesmoke",
        padding: "3.75px 0px",
        borderRadius: "5px",
        boxShadow: "2.5px 2.5px 0 0 #8882",
        top: "calc(50% - 39.5px)",
        cursor: "pointer",
        userSelect: "none",
        webkitTapHighlightColor: "transparent"
      }
    }
  },
  template:
  `<div
    :style=styleObject
    @mousedown=handleMouseDown
    @mouseup=handleMouseUp
    @mouseout=handleMouseUp
    @touchstart=handleMouseDown
    @touchend=handleMouseUp
    @touchcancel=handleMouseUp
  >
    {{ widthPercentage + '%' }}
  </div>`,
  methods: {
      handleMouseDown: async function() {
          this.styleObject.boxShadow = "0px 0px 0 0 #8888";
          this.styleObject.left = "calc(" + this.widthPercentage + "% - 25.25px)";
          this.styleObject.top = "calc(50% - 37px)";
          setTimeout(() => { this.styleObject.transition = "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s"}, 150);
      },
      handleMouseUp: function() {
          this.styleObject.boxShadow = "2.5px 2.5px 0 0 #8882";
          this.styleObject.left = "calc(" + this.widthPercentage + "% - 28.75px)";
          this.styleObject.top = "calc(50% - 39.5px)";
          this.styleObject.transition = "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s";
      }
  }
});

export default {}
