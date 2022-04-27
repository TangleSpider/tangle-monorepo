<template>
    <div>
        Block Number: <span>{{ ntoa(blockNumber) }}</span>
    </div>
</template>

<script>
    export default {
        mounted() {
            ethereum.on("message", message =>
                this.blockNumber = message.data.result.number
            );
            ethereum.request({
                method: "eth_getBlockByNumber", params: ["latest", true]
            }).then(block => ethereum.emit("message", {
                data: { result: block }
            }));
        },
        methods: {
            ntoa(v) { return (v = parseInt(v), isNaN(v) ? '~' : v) }
        },
        data() {
            return {
                blockNumber: null
            }
        }
    }
</script>
