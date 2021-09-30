Vue.component("amount-selector", {
    props: ["id"],
    data() {
        return {
            styleObject0: {
            },
            styleObject1: {
                fontFamily: "monospace",
                width: 100
            },
            selected: null
        }
    },
    computed: {
        componentLabel: function () {
            return `Amount`;
            return `amountSelector${this.id}:${this.selected}`;
        },
        selectedComputed: {
            get() {
                return this.selected;
            },
            set(newVal) {
                this.selected = newVal;
                if (this.selected && this.selected.match && this.selected.match(/^[1-9]\d*$/)) {
                    this.$root.$emit("newAmount", {
                        id: this.id,
                        amount: this.selected
                    });
                } else {
                    this.$root.$emit("newAmount", {
                        id: this.id,
                        amount: null
                    });
                }
            }
        }
    },
    template:
        `<div
            :style=styleObject0
        >
            <div>
                {{ componentLabel }}
            </div>
            <input
                :style=styleObject1
                type="text"
                v-model="selectedComputed"
                @blur=blur
                @focus=focus
                @mouseover=mouseover
                @mouseout=mouseout
            >
        </div>`,
    methods: {
        blur: function () {
            this.hovered = false;
            this.focused = false;
            this._selected = this.selected;
            this.selected = this.formatAmount(this._selected);
        },
        focus: function() {
            this.hovered = false;
            this.focused = true;
            this.selected = this._selected;
        },
        mouseout: function () {
            if (this.hovered)
                this.blur();
        },
        mouseover: function() {
            if (!this.focused) {
                this.hovered = true;
                this.selected = this._selected;
            }
        },
        formatAmount: selected => {
            if (selected && selected.match && selected.match(/^[1-9]\d+$/))
                return selected; //format with decimals
            return selected;
        }
    }
});

export default {}
