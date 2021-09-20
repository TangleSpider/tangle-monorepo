Vue.component("market-making-toggle", {
  data() {
    return {
      styleObject: {
        webkitTapHighlightColor: "transparent",
        userSelect: "none",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        fontSize: 13,
        textDecoration: "underline",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: 10
      }
    }
  },
  props: ["toggle"],
  template:
    `<div
      :style=styleObject
    >
      {{ (toggle ? "Hide" : "Show") + " Market Making Options"}}
    </div>`
});

export default {}
