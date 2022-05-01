<template>
    <InputSingle
        v-for="input in inputs.filter(input => input.type != 'tuple')"
        :name="input.name"
        :parent="name"
        :selectedAddress="selectedAddress"
    />
    <InputTuple
        v-for="input in inputs.filter(input => input.type == 'tuple')"
        :name="input.name"
        :components="input.components"
        :parent="name"
        :selectedAddress="selectedAddress"
    />
</template>

<script>
    export default {
        props: ["name", "inputs", "selectedAddress"],
        components: coms(["InputSingle", "InputTuple"])
    }
</script>
