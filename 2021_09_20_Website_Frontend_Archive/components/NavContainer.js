import "./NavLogo.js";
import "./NavLinksContainer.js";

Vue.component("nav-container", {
  data() {
    return {
      styleObject: {
        height: 90,
      }
    }
  },
  template:
    `<div
      :style=styleObject
    >
        <nav-logo />
        <nav-links-container />
    </div>`
});

export default {}
