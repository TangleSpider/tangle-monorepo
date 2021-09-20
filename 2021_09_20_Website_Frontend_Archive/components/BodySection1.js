Vue.component("body-section-1", {
  data() {
    return {
        styleObject: {
            display: "flex",
            justifyContent: "center",
            gap: "50px",
            marginTop: 100,
            alignItems: "center",
            flexDirection: "row"
        },
        styleObject2: {
            width: 450
        },
        styleObject3: {
            fontWeight: 600,
            width: 442,
            fontSize: 64,
            background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(256, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
            padding: "6 113",
            fontStyle: "italic",
            backgroundBlendMode: "multiply",
            fontVariant: "small-caps",
            color: "white"
        },
        styleObject4: {
            width: 442,
            display: "flex",
            fontWeight: 600,
            fontSize: 89,
            marginTop: 10
        },
        styleObject5: {
            display: "flex",
            justifyContent: "center",
            gap: "25px",
            marginTop: 25,
            flexWrap: "wrap"
        },
        styleObject6: {
            border: "none",
            background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(256, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
            borderRadius: "5px",
            padding: "10 25",
            fontSize: 24,
            color: "white",
            cursor: "pointer",
            position: "relative",
            transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
            boxShadow: "5px 5px 0 0 #8882",
            flexBasis: "45%"
        },
        items: [
            { label: "Buy on ARB!", extraStyle: {
                backgroundImage: "linear-gradient(to right,#0993ec,#f338c3,rgba(9,147,236,0))";
            }},
            { label: "Buy on FTM!", extraStyle: {
                color: "rgb(57, 74, 109)",
                background: "linear-gradient(137.13deg, rgb(140, 140, 227) 15.73%, rgb(150, 217, 237) 86.83%)"
            }},
            { label: "Buy on AVAX!", extraStyle: {
                background: "rgb(230, 96, 0)"
            }},
            { label: "Buy on ETH!", extraStyle: {
                background: "rgb(232, 0, 111)"
            }},
            { label: "Buy on BSC!", extraStyle: {
                background: "rgb(31, 199, 212)"
            }}
        ]
    }
  },
  mounted() {
      this.$root.$on("mobileView", () => {
          this.styleObject.flexDirection = "column";
      });
      this.$root.$on("desktopView", () => {
          this.styleObject.flexDirection = "row";
      });
  },
  template:
    `<div
      :style=styleObject
    >
        <div
            :style=styleObject2
        >
            <span :style=styleObject3>Tangle</span><br>
            <div :style=styleObject4>The Self Marketing Token</div>
            <div
                :style=styleObject5
            >
                <button
                    v-for="item in items"
                    :key="item.label"
                    :style="[styleObject6, item.extraStyle]"
                    @mouseover=handleMouseOver
                    @mouseout=handleMouseOut
                    @mousedown="handleMouseDown($event, item)"
                    @mouseup=handleMouseUp
                    @touchstart="handleMouseDown($event, item)"
                >
                    {{ item.label }}
                </button>
            </div>
        </div>
        <div
            :style=styleObject2
        >
            <video width="442" height="442" autoplay loop muted>
                <source src="web/images/tangleRotate2.webm" type="video/webm">
            </video
        </div>
    </div>`,
    methods: {
      handleMouseOver: function(e) {
        e.target.style.boxShadow = "5px 5px 0 0 #8882";
        e.target.style.left = 0;
        e.target.style.top = 0;
      },
      handleMouseOut: function(e) {
        e.target.style.boxShadow = "5px 5px 0 0 #8882";
        e.target.style.left = 0;
        e.target.style.top = 0;
      },
      handleMouseDown: async function(e, i) {
        e.target.style.left = 5;
        e.target.style.top = 5;
        switch(i.label) {
            case "Buy on AVAX!": window.open("https://app.pangolin.exchange/#/swap?inputCurrency=ETH&outputCurrency=0xAf1843657F00F8C048139B7103784fdeFC403702", "_blank"); break;
            case "Buy on BSC!": window.open("https://pancakeswap.finance/swap?inputCurrency=ETH&outputCurrency=0xA536F6459E104666b2C08118F5A835De311D8E47", "_blank"); break;
            case "Buy on ETH!": window.open("https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xC7827a6CCc51176A986F05Ec8572244aecE6bf2e", "_blank"); break;
            case "Buy on FTM!": window.open("https://spookyswap.finance/swap?inputCurrency=ETH&outputCurrency=0x2F96f61a027B5101E966EC1bA75B78f353259Fb3", "_blank"); break;
            case "Buy on ARB!": window.open(" https://app.sushi.com/swap?inputCurrency=0x82af49447d8a07e3bd95bd0d56f35241523fbab1&outputCurrency=0x69F012e4dD7C2dd75cd02CCb239E42642647e0cD", "_blank"); break;
        }
      },
      handleMouseUp: function(e) {
        e.target.style.boxShadow = "5px 5px 0 0 #8882";
        e.target.style.left = 0;
        e.target.style.top = 0;
      }
    }
});

export default {}
