<template>
    <DateTime />
    <Web3 />
</template>

<script>
    export default {
        computed: {
            storage() {
                console.log(localStorage.enabled);
                return localStorage.enabled;
            }
        },
        components: aComs(["DateTime", "Web3"])
    }
</script>
