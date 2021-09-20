Vue.component("body-section-2", {
  data() {
    return {
      styleObject: {
          background: "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(256, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
          padding: "100 60",
          marginTop: 100
      },
      styleObject2: {
          fontWeight: 600,
          fontSize: 48,
          color: "white",
          padding: "0 60",
          textDecoration: "underline"
      },
      styleObject3: {
          fontSize: 32,
          color: "white",
          marginTop: 48,
          padding: "0 60"
      },
      styleObject4: {
          fontSize: 32,
          color: "white",
          padding: "0 60"
      },
      styleObject5: {
          border: "3px solid white",
          background: "none",
          borderRadius: "5px",
          padding: "5 20",
          fontSize: 32,
          color: "white",
          cursor: "pointer",
          position: "relative",
          transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s"
      },
      styleObject6: {
          color: "whitesmoke"
      }
    }
  },
  template:
    `<div
      :style=styleObject
    >
        <div
            :style=styleObject2
        >
            What does Tangle do?
        </div>
        <div
            :style=styleObject3
        >
            Tangle is a revolutionary and experimental token that promotes itself by rewarding those who increase Tangle's attractiveness.
            <br>
            Tangle will also be used in the upcoming deFi zero-consensus prediction market system Forutsi. <a :style=styleObject6 href='https://orbi-dev.medium.com/forutsi-a-zero-consensus-crypto-prediction-market-7e62575b635d'>Learn more about Forutsi.</a>
            <br><br>
            What can you do to be rewarded?
        </div>
        <ul
            :style=styleObject4
        >
            <li>Create Market Activity, buying/selling is rewarded through the app!</li>
            <li>Increase Holder Count via Airdrops, sending Tangle to those who have never held it is rewarded through the app!</li>
            <li>Stake Liquidity, staking liquidity is rewarded through the app!</li>
            <li>Hold and acquire reflections!</li>
        </ul>
        <div
            :style=styleObject3
        >
            Earn rewards today through the
            <button
                :style=styleObject5
                @mouseover=handleMouseOver
                @mouseout=handleMouseOut
                @mousedown=handleMouseDown
                @touchstart=handleMouseDown
                @mouseup=handleMouseUp
                @touchend=handleMouseUp
                @touchcancel=handleMouseOut
            >
                App!
            </button>
        </div>
    </div>`,
    methods: {
      handleMouseOver: function() {
        this.styleObject5.boxShadow = "5px 5px 0 0 #8882";
        this.styleObject5.background = "#fff2";
        this.styleObject5.left = 0;
        this.styleObject5.top = 0;
      },
      handleMouseOut: function() {
        this.styleObject5.boxShadow = "5px 5px 0 0 #8882";
        this.styleObject5.background = "#fff0";
        this.styleObject5.left = 0;
        this.styleObject5.top = 0;
      },
      handleMouseDown: async function() {
        this.styleObject5.boxShadow = "0px 0px 0 0 #8888";
        this.styleObject5.background = "#fff4";
        this.styleObject5.left = 5;
        this.styleObject5.top = 5;
        window.open("https://tangle.co.in/web/html/app.html", "_blank");
      },
      handleMouseUp: function() {
        this.styleObject5.boxShadow = "5px 5px 0 0 #8882";
        this.styleObject5.background = "#fff2";
        this.styleObject5.left = 0;
        this.styleObject5.top = 0;
      }
    }
});

export default {}
