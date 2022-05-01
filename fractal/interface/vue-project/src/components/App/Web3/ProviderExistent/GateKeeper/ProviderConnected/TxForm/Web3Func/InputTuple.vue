<template>
    <InputSingle
        v-for="component in components.filter(component => component.type != 'tuple')"
        :name="component.name"
        :parent="`${parent}.${name}`"
        :selectedAddress="selectedAddress"
    />
    <InputTuple
        v-for="component in components.filter(component => component.type == 'tuple')"
        :name="component.name"
        :components="component.components"
        :parent="`${parent}.${name}`"
        :selectedAddress="selectedAddress"
    />
</template>

<script>
    export default {
        props: ["name", "components", "parent", "selectedAddress"],
        components: coms(
            ["InputSingle", "InputTuple"],
            (() => { return import.meta.url; })().match(/.*?Web3Func/)[0]
        )
    }
</script>
