<template>
    <BlockNumber />
    <ChainID />
    <GateKeeper />
</template>

<script>
    export default {
        mounted() {
            ethereum.request({
                method: "eth_subscribe", params: ["newHeads"]
            });
        },
        components: coms(["BlockNumber", "ChainID", "GateKeeper"])
    }
</script>
