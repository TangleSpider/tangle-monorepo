<template>
    <div>
        {{ name }}
    </div>
    <div style="margin-left: 20px;">
        <InputSingle
            v-for="input in inputs.filter(input => input.type != 'tuple')"
            :name="input.name"
        />
        <InputTuple
            v-for="input in inputs.filter(input => input.type == 'tuple')"
            :name="input.name"
            :components="input.components"
        />
    </div>
</template>

<script>
    export default {
        props: ["name", "inputs"],
        components: aComs([
            "InputSingle",
            "InputTuple",
        ], "/Web3/ProviderExistent/GateKeeper/ProviderConnected/TxForm/Web3Func")
    }
</script>
