Vue.component("chain-selector", {
    props: ["id"],
    data() {
        return {
            styleObject0: {
                width: 100
            },
            styleObject1: {
                width: 100
            },
            selected: null
        }
    },
    mounted() {
        this.$root.$emit("newChain", {
            id: this.id,
            token: this.selected
        });
    },
    computed: {
        componentLabel: function () {
            return `Chain`;
            return `chainSelector${this.id}:${this.selected}`;
        },
        selectedComputed: {
            get() {
                return this.selected;
            },
            set(newVal) {
                this.selected = newVal;
                this.$root.$emit("newChain", {
                    id: this.id,
                    chain: this.selected
                });
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
            <select v-model="selectedComputed" :style=styleObject1>
                <option :value="null" selected disabled>Select chain</option>
                <option>AVAX</option>
                <option>BSC</option>
                <option>P14</option>
                <option>P15</option>
            </select>
        </div>`
});

export default {}
