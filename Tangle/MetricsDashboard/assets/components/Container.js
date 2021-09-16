Vue.component("container", {
  data() {
    return {
      styleObject: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60 0",
        color: "#310",
        width: 375,
        overflow: "hidden",
        color: "darkslategrey"
      }
    }
  },
  mounted() {
      console.log("test");
  },
  template:
    `<div
      :style=styleObject
    >
        test
    </div>`
});

export default {}
