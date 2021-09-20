import "./DistributingSliderContainer.js";
import "./DistributingLabel.js";
import "./DistributingCollectButton.js";
import "./DistributingSendButton.js";

Vue.component("distributing-toggleable-container", {
    data() {
        return {
            styleObject: {
                transition: "max-height cubic-bezier(0.04, 0.9, 0.49, 0.9) 0.15s",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                overflow: "hidden",
                maxHeight: 0,
                width: 375
            },
            approveGTEStake: true,
            isStaked: false,
            sliderPosition: 0
        }
    },
    watch: {
        toggle: function (a, b) {
            if (a) this.$root.earningOptionsMaxHeight += 155;
            if (b && this.$root.earningOptionsMaxHeight) this.$root.earningOptionsMaxHeight -= 155;
            this.styleObject.maxHeight = a ? 155 : 0;
            this.$root.$emit("earningOptionsResize");
        }
    },
    props: ["toggle"],
    template:
        `<div
        :style=styleObject
        >
            <distributing-slider-container />
            <distributing-label />
            <distributing-collect-button />
            <distributing-send-button />
        </div>`
});

export default {}
