<template>
    <select v-model="selectedAction">
        <option selected disabled>Action</option>
        <option v-for="func in abi">{{ func.name }}</option>
    </select>
    <template v-for="func in abi">
        <Web3Func
            v-if="selectedAction == func.name"
            :name="func.name"
            :inputs="func.inputs"
            :selectedAddress="selectedAddress"
        />
    </template>
</template>

<script>
    export default {
        props: ["selectedAddress"],
        mounted() {
            import("/src/lib/fractal_0-2-1_ABI")
            .then(mod => {
                console.log(mod.default);
                this.abi = mod.default;
            });
        },
        data() {
            return {
                abi: [],
                selectedAction: "Action"
            }
        },
        components: coms(["Web3Func"])
    }
</script>
