Vue.component("banner-image", {
  data() {
    return {
      styleObject: {
        width: 375
      }
    }
  },
  template:
    `<img
      :style=styleObject
      src="../images/tangleLogo_7_6.png"
    >`
});

export default {}
