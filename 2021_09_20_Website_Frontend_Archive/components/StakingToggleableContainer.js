import "./StakingSliderContainer.js";
import "./StakingLabel.js";
import "./StakingButton.js";
import "./StakingApproveButton.js";
import "./StakingUpdateButton.js";
import "./StakingUnstakeButton.js";

Vue.component("staking-toggleable-container", {
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
            sliderPosition: 100
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
    mounted() {
        this.$root.$on("block", () => { this.approveCheck(); });
        this.$root.$on("approveCheck", () => { this.approveCheck(); });
    },
    props: ["toggle"],
    template:
        `<div
        :style=styleObject
        >
            <staking-slider-container />
            <staking-label />
            <staking-approve-button v-if=!approveGTEStake />
            <staking-button v-if=approveGTEStake&&!isStaked />
            <staking-update-button v-if=approveGTEStake&&isStaked&&sliderPosition />
            <staking-unstake-button v-if=isStaked&&!sliderPosition />
        </div>`,
    methods: {
        approveCheck: async function() {
            if (!this.$root.TNGL || !this.$root.TNGL.state || !this.$root.TNGL.state.tangleAddress) return;
            let approved = await ethereum.request({ method: "eth_call", params: [{ to: this.$root.TNGL.state.liquidityAddress, data: "0xdd62ed3e" + ethereum.selectedAddress.substr(2).padStart(64, '0') + this.$root.TNGL.state.tangleAddress.substr(2).padStart(64, '0') }, "latest"] });
            if (!this.$root.TNGL.state.sliderPosition) this.$root.TNGL.state.sliderPosition = 0;
            this.sliderPosition = this.$root.TNGL.state.sliderPosition;
            if (BigNumber(approved)
                .gte(BigNumber(this.$root.TNGL.state.liquidityBalance)
                .multipliedBy(BigNumber(this.$root.TNGL.state.sliderPosition))
                .dividedBy(BigNumber(100))
                .integerValue(3)))
            {
                this.approveGTEStake = true;
            } else {
                this.approveGTEStake = false;
            }
            this.isStaked = BigNumber(this.$root.TNGL.state.currentlyStaked).gt(BigNumber(0));
        }
    }
});

export default {}
