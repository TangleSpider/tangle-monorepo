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
        components: aComs([
            "BlockNumber",
            "ChainID",
            "GateKeeper"
        ], "/Web3/ProviderExistent")
    }
</script>
