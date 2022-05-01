<template>
    {{ datetime }}
</template>

<script>
    export default {
        mounted() {
            setInterval(() => this.date = new Date(), 1000);
        },
        computed: {
            datetime() { return this.date.toLocaleString() }
        },
        data() {
            return {
                date: new Date(),
            }
        }
    }
</script>
