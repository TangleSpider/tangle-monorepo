import "./NavContainer.js";
import "./MobileNavContainer.js";
import "./BodyContainer.js";
import "./FooterContainer.js";
import "./MobileNavSidebar.js";

Vue.component("landing-page-container", {
  data() {
    return {
      styleObject: {

      },
      view: "desktop"
    }
  },
  mounted() {
      this.$root.$on("mobileView", () => {
          this.view = "mobile";
      });
      this.$root.$on("desktopView", () => {
          this.view = "desktop";
      });
  },
  template:
    `<div
      :style=styleObject
    >
        <mobile-nav-sidebar />
        <mobile-nav-container v-if="view == 'mobile'" />
        <nav-container v-if="view == 'desktop'" />
        <body-container />
        <footer-container />
    </div>`
});

export default {}
