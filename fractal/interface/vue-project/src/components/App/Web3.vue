<template>
    <ProviderNonexistent v-if="!providerExists" />
    <ProviderExistent v-if="providerExists" />
</template>

<script>
    export default {
        data() {
            return {
                providerExists: window.ethereum
            }
        },
        components: coms(["ProviderExistent", "ProviderNonexistent"])
    }
</script>
