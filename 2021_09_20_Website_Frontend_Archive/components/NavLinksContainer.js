Vue.component("nav-links-container", {
  data() {
    return {
      styleObject: {
          height: 90,
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
          gap: "60px"
      },
      styleObject2: {
          cursor: "pointer"
      },
      items: [
          { label: "Whitepaper" },
          { label: "Tangle App" },
          { label: "Meta" }
      ]
    }
  },
  template:
    `<div
      :style=styleObject
    >
        <span
            v-for="item in items"
            :key="item.label"
            @click=handleClick(item)
            @mouseover=handleMouseOver
            @mouseout=handleMouseOut
            @mousedown=handleClick(item)
            @touchstart=handleClick(item)
            :style=styleObject2
        >
            {{ item.label }}
        </span>
    </div>`,
    methods: {
        handleClick: function(i) {
            switch(i.label) {
                case "Whitepaper": window.open("https://tangle.co.in/TangleWhitepaper.pdf", "_blank"); break;
                case "Tangle App": window.open("https://tangle.co.in/web/html/app.html", "_blank"); break;
                case "Meta": window.open("https://tangle.co.in/web/html/meta.html", "_blank"); break;
            }
        },
        handleMouseOver: function(e) {
            e.target.style.textDecoration = "underline";
        },
        handleMouseOut: function(e) {
            e.target.style.textDecoration = "";
        }
    }
});

export default {}
