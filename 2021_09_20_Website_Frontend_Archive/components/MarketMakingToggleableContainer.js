Vue.component("market-making-toggleable-container", {
    data() {
        return {
            styleObject: {
                transition: "max-height cubic-bezier(0.04, 0.9, 0.49, 0.9) 0.15s",
                display: "flex",
                justifyContent: "center",
                overflow: "hidden",
                maxHeight: 0,
                width: 375
            },
            styleObject2: {
                textAlign: "center",
                marginTop: 5
            },
            approveGTEStake: true,
            isStaked: false,
            sliderPosition: 0
        }
    },
    watch: {
        toggle: function (a, b) {
            if (a) this.$root.earningOptionsMaxHeight += 41;
            if (b && this.$root.earningOptionsMaxHeight) this.$root.earningOptionsMaxHeight -= 41;
            this.styleObject.maxHeight = a ? 41 : 0;
            this.$root.$emit("earningOptionsResize");
        }
    },
    props: ["toggle"],
    template:
        `<div
            :style=styleObject
        >
            <div
                :style=styleObject2
            >
                No tools needed here! Each buy or sell of at least 1 TangleV3 earns a point that generates rewards!
            </div>
        </div>`
});

export default {}
