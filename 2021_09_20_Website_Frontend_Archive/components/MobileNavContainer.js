import "./NavLogo.js";
import "./NavLinksContainer.js";

Vue.component("mobile-nav-container", {
  data() {
    return {
        styleObject: {
            height: 90,
        },
        styleObject2: {
            top: 14,
        	width: 70,
        	height: 70,
        	position: "absolute",
        	right: 28,
            outline: "1px solid #eee",
            borderRadius: "5px",
            padding: "0 5px"
        },
        styleObject3: {
            position: "relative",
        	top: 10,
        	width: "100%",
        	height: 10,
        	backgroundColor: "#f2f2fa",
            borderRadius: "5px",
            background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))"
        },
        styleObject4: {
            position: "relative",
        	top: 20,
        	width: "100%",
        	height: 10,
        	backgroundColor: "#f2f2fa",
            borderRadius: "5px",
            background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))"
        },
        styleObject5: {
            position: "relative",
        	top: 30,
        	width: "100%",
        	height: 10,
        	backgroundColor: "#f2f2fa",
            borderRadius: "5px",
            background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))"
        }
    }
  },
  template:
    `<div
      :style=styleObject
    >
        <nav-logo />
        <div
            :style=styleObject2
            @mousedown="handleMouseDown($event)"
        >
            <div :style=styleObject3></div>
            <div :style=styleObject4></div>
            <div :style=styleObject5></div>
        </div>
    </div>`,
    methods: {
        handleMouseDown: function(e) {
            this.$root.$emit("toggleMobileNavSidebar");
        }
    }
});

export default {}
