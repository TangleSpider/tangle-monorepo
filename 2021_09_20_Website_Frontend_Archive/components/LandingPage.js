import "./LandingPageContainer.js";

let app = new Vue({
    data() {
      return {
        styleObject: {
            width: "100%"
        },
        windowInnerWidth: window.innerWidth
      }
    },
    mounted() {
        if (window.innerWidth < 1100) this.$root.$emit("mobileView");
        setInterval(this.checkWindowOuterWidth, 100);
    },
    el: "#app",
    template:
    `<div
        :style=styleObject
    >
        <landing-page-container />
    </div>`,
    methods: {
        checkWindowOuterWidth: function() {
            if (this.windowInnerWidth >= 1100 && window.innerWidth < 1100) this.$root.$emit("mobileView");
            if (this.windowInnerWidth < 1100 && window.innerWidth >= 1100) this.$root.$emit("desktopView");
            this.windowInnerWidth = window.innerWidth;
        }
    }
});
