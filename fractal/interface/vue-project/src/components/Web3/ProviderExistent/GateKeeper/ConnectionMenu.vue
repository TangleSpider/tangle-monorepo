<template>
    <div>
        <AutoConnect :autoconnect="autoconnect"/>
        <ConnectButton v-if="!selectedAddress && !autoconnect"/>
    </div>
</template>

<script>
    export default {
        props: ["selectedAddress", "autoconnect"],
        components: aComs([
            "AutoConnect",
            "ConnectButton"
        ], "/Web3/ProviderExistent/GateKeeper/ConnectionMenu")
    }
</script>
