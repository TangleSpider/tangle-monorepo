Vue.component("token-selector", {
    props: ["id"],
    data() {
        return {
            styleObject0: {
            },
            styleObject1: {
                fontFamily: "monospace",
                width: 100
            },
            focused: false,
            hovered: false,
            _selected: null,
            selected: null
        }
    },
    computed: {
        componentLabel: function () {
            return `Token Address`;
            return `tokenSelector${this.id}:${this.selected}`;
        },
        selectedComputed: {
            get() {
                return this.selected;
            },
            set(newVal) {
                this.selected = newVal;
                if (this.selected && this.selected.match && this.selected.match(/^0x[0-9a-f]{40}$/i)) {
                    this.$root.$emit("newToken", {
                        id: this.id,
                        token: this.selected
                    });
                } else {
                    this.$root.$emit("newToken", {
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
            this.selected = this.formatAddress(this._selected);
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
        formatAddress: selected => {
            if (selected && selected.match && selected.match(/^0x[0-9a-f]{40}$/i))
                return `${selected.substr(0, 5)}...${selected.substr(-3)}`;
            return selected;
        }
    }
});

export default {}
