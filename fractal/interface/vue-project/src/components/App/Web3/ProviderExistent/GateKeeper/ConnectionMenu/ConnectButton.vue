<template>
    <button @click="ethereum.emit('connectRequest')">
        Connect
    </button>
</template>

<script>
    export default {
        data() {
            return {
                ethereum: ethereum
            }
        }
    }
</script>
