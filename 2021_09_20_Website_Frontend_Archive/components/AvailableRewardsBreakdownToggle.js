Vue.component("available-rewards-breakdown-toggle", {
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
        cursor: "pointer"
      }
    }
  },
  props: ["toggle"],
  template:
    `<div
      :style=styleObject
    >
      {{ (toggle ? "Hide" : "Show") + " Reward Breakdown"}}
    </div>`
});

export default {}
