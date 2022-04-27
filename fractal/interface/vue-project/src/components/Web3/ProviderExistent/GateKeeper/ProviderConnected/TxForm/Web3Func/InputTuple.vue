<template>
    <div>
        {{ name }}
    </div>
    <div style="margin-left: 20px;">
        <InputSingle
            v-for="component in components.filter(component => component.type != 'tuple')"
            :name="component.name"
        />
        <InputTuple
            v-for="component in components.filter(component => component.type == 'tuple')"
            :name="component.name"
            :components="component.components"
        />
    </div>
</template>

<script>
    export default {
        props: ["name", "components"],
        components: aComs([
            "InputSingle",
            "InputTuple",
        ], "/Web3/ProviderExistent/GateKeeper/ProviderConnected/TxForm/Web3Func")
    }
</script>
