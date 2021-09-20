import "./BodySection1.js";
import "./BodySection2.js";

Vue.component("body-container", {
  data() {
    return {
      styleObject: {
      }
    }
},
  template:
    `<div
      :style=styleObject
    >
        <body-section-1 />
        <body-section-2 />
    </div>`
});

export default {}
