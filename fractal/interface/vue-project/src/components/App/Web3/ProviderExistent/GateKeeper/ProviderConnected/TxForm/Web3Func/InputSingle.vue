<template>
    <div>
        <span>{{ `${parent}.${name}` }}</span>
        <input :disabled="foo()" :value="bar()"/>
        <component v-if="baz()" :is="chuck"></component>
    </div>
</template>

<script>
    import { defineAsyncComponent } from "vue";
    export default {
        props: ["name", "parent", "selectedAddress"],
        computed: {
            chuck() {
                let c;
                switch (`${this.parent}.${this.name}`) {
                    case "propose.goods": c = "FooBar"; break;
                    default: return "div";
                }
                return defineAsyncComponent(
                    () => import(`./InputSingle/${c}.vue`)
                );
            }
        },
        methods: {
            foo() {
                switch (`${this.parent}.${this.name}`) {
                    case "propose.goods": return true;
                    case "propose.proposal.proposer": return true;
                    default: return false;
                }
            },
            bar() {
                switch (`${this.parent}.${this.name}`) {
                    case "propose.proposal.proposer":
                        return this.selectedAddress;
                    default: return null;
                }
            },
            baz() {
                switch (`${this.parent}.${this.name}`) {
                    case "propose.goods": return true;
                    default: return false;
                }
            }
        }
    }
</script>
