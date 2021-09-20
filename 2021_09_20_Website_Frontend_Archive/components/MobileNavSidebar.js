Vue.component("mobile-nav-sidebar", {
    data() {
        return {
            styleObject: {
                position: "absolute",
                backgroundColor: "#222222",
                width: "calc(100% - 160px)",
                height: "100%",
                zIndex: 2,
                left: "-100%",
                transition: "left cubic-bezier(0, 0, 0, 1) 0.66s",
                padding: "40px 80px"
            },
            styleObject2: {
                	position: "relative",
                	fontSize: "3rem",
                	margin: "40px 0"
            },
            styleObject3: {
                	color: "whitesmoke",
            },
            styleObject4: {
            	top: 20,
            	width: 50,
            	height: 50,
            	position: "absolute",
            	right: 40
            },
            items: [
                { label: "Whitepaper", href: "https://tangle.co.in/TangleWhitepaper.pdf" },
                { label: "Tangle App", href: "https://tangle.co.in/web/html/app.html" },
                { label: "Meta", href: "https://tangle.co.in/web/html/meta.html" },
                { label: "Buy Tangle (ARBI)", href: "https://app.sushi.com/swap?inputCurrency=0x82af49447d8a07e3bd95bd0d56f35241523fbab1&outputCurrency=0x69F012e4dD7C2dd75cd02CCb239E42642647e0cD" },
                { label: "Buy Tangle (AVAX)", href: "https://app.pangolin.exchange/#/swap?inputCurrency=ETH&outputCurrency=0xAf1843657F00F8C048139B7103784fdeFC403702" },
                { label: "Buy Tangle (BSC)", href: "https://pancakeswap.finance/swap?inputCurrency=ETH&outputCurrency=0xA536F6459E104666b2C08118F5A835De311D8E47" },
                { label: "Buy Tangle (ETH)", href: "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xC7827a6CCc51176A986F05Ec8572244aecE6bf2e" },
                { label: "Buy Tangle (FTM)", href: "https://spookyswap.finance/swap?inputCurrency=ETH&outputCurrency=0x2F96f61a027B5101E966EC1bA75B78f353259Fb3" },
            ]
        }
    },
  mounted() {
      this.$root.$on("toggleMobileNavSidebar", () => {
          this.styleObject.left = this.styleObject.left ? 0 : "-100%";
      });
  },
  template:
    `<div
      :style=styleObject
    >
        <img :style="styleObject4" @mousedown="handleMouseDown($event)" src="../web/images/iconfinder_Close_4781838.png"></img>
        <div
            v-for="item in items"
            :style="styleObject2"
            :href="item.href"
        >
            <a :href="item.href" :style="styleObject3"> {{ item.label }} </a>
        </div>
    </div>`,
    methods: {
        handleMouseDown: function(e) {
            this.$root.$emit("toggleMobileNavSidebar");
        }
    }
});

export default {}
