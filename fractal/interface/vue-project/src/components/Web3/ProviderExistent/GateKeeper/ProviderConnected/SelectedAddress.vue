<template>
    <div>
        Account: <span>{{ selectedAddress }}</span>
    </div>
</template>

<script>
    export default {
        props: ["selectedAddress"]
    }
</script>
