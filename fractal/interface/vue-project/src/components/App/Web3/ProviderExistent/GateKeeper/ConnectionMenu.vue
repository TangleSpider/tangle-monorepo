<template>
    <div>
        <AutoConnect :autoconnect="autoconnect"/>
        <ConnectButton v-if="!selectedAddress && !autoconnect"/>
    </div>
</template>

<script>
    export default {
        props: ["selectedAddress", "autoconnect"],
        components: coms(["AutoConnect", "ConnectButton"])
    }
</script>
