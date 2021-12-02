Vue.component("footer-container", {
  data() {
    return {
      styleObject: {
          height: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "50px"
      },
      styleObject2: {
          cursor: "pointer",
          width: 64,
          transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
          position: "relative"
      },
      items: [
          { label: "Telegram", src: "../../web/images/iconfinder_telegram_3649750Fill.png"},
          { label: "Twitter", src: "../../web/images/iconfinder_twiter-social-network-brand-logo_1820440Fill.png" },
          { label: "GitHub", src: "../../web/images/iconfinder_Github_669674Fill.png" },
          { label: "Discord", src: "../../web/images/5761437_discord_logo_icon.png" }
      ]
    }
  },
  template:
    `<div
      :style=styleObject
    >
        <img
            v-for="item in items"
            :style=styleObject2
            :src="item.src"
            @mouseover=handleMouseOver
            @mouseout=handleMouseOut
            @mousedown="handleMouseDown($event, item)"
            @touchstart="handleMouseDown($event, item)"
            @mouseup=handleMouseUp
        >
    </div>`,
    methods: {
      handleMouseOver: function(e) {
        e.target.style.left = 0;
        e.target.style.top = 0;
      },
      handleMouseOut: function(e) {
        e.target.style.left = 0;
        e.target.style.top = 0;
      },
      handleMouseDown: async function(e, i) {
        e.target.style.left = 5;
        e.target.style.top = 5;
        switch(i.label) {
            case "Telegram": window.open("https://t.me/TangleCoin", "_blank"); break;
            case "Twitter": window.open("https://twitter.com/TangleCoin", "_blank"); break;
            case "GitHub": window.open("https://github.com/TangleSpider/Tangle", "_blank"); break;
            case "Discord": window.open("https://discord.gg/kNx8rmYCWk", "_blank"); break;
        }
      },
      handleMouseUp: function(e) {
        e.target.style.left = 0;
        e.target.style.top = 0;
      }
    }
});

export default {}
