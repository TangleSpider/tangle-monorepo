Vue.component("add-liquidity-button", {
    data() {
        return {
            style: {
                webkitTapHighlightColor: "transparent",
                fontSize: 16,
                fontWeight: 500,
                height: 40,
                width: 145,
                borderRadius: "10px",
                border: 0,
                color: "whitesmoke",
                marginTop: 10,
                boxShadow: "5px 5px 0 0 #8882",
                background: "linear-gradient(rgb(155 155 155), transparent), linear-gradient(to left top, rgb(168 168 168 / 67%), transparent), linear-gradient(to right top, rgb(218 218 218), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))",
                backgroundBlendMode: "normal",
                transition: "box-shadow cubic-bezier(0, 0.67, 0.29, 1) 0.1s, left cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s, top cubic-bezier(0, 0.67, 0.29, 1.33) 0.15s",
                cursor: "not-allowed",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                fontFamily: "sans-serif"
            },
            approvals: [false, false]
        }
    },
    mounted() {
        this.$root.$on("approvalChange", a => {
            this.approvals[a.id] = a.approved;
            this.change();
        });
    },
    template:
        `<button
            :style=style
            @mouseover=handleMouseOver
            @mouseout=handleMouseOut
            @mousedown=handleMouseDown
            @mouseup=handleMouseUp
            @touchend=handleMouseUp
            @touchcancel=handleMouseOut
        >
            Add Liquidity
        </button>`,
    methods: {
        handleMouseOver: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        handleMouseOut: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        handleMouseDown: async function() {
            if (!this.approvals.reduce((p, c) => { return p && c; })) return;
            this.style.boxShadow = "0px 0px 0 0 #8888";
            this.style.left = 5;
            this.style.top = 5;
        },
        handleMouseUp: function() {
            this.style.boxShadow = "5px 5px 0 0 #8882";
            this.style.left = 0;
            this.style.top = 0;
        },
        change: function() {
            let allApprovals = this.approvals.reduce((p, c) => { return p && c; });
            if (!allApprovals) {
                this.style.background = this.style.background = "linear-gradient(rgb(155 155 155), transparent), linear-gradient(to left top, rgb(168 168 168 / 67%), transparent), linear-gradient(to right top, rgb(218 218 218), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "not-allowed";
            } else {
                this.style.background = "linear-gradient(rgb(255, 60, 91), transparent), linear-gradient(to left top, rgba(255, 6, 246, 0.667), transparent), linear-gradient(to right top, rgb(251, 192, 135), transparent), radial-gradient(rgb(255, 255, 255), rgb(255, 255, 255))";
                this.style.cursor = "pointer";
            }
        }
    }
});

export default {}
