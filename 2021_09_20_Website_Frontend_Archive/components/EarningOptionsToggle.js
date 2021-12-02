Vue.component("earning-options-toggle", {
  data() {
    return {
      styleObject: {
        webkitTapHighlightColor: "transparent",
        userSelect: "none",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        fontSize: 16,
        textDecoration: "underline",
        fontWeight: 600,
        cursor: "pointer"
      }
    }
  },
  props: ["toggle"],
  template:
    `<div
      :style=styleObject
    >
      {{ (toggle ? "Hide" : "Show") + " Earning Options"}}
    </div>`
});

export default {}
