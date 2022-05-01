<template>
    <div>
        <SelectedAddress :selectedAddress="selectedAddress"/>
        <NativeBalance :selectedAddress="selectedAddress"/>
        <TxForm :selectedAddress="selectedAddress"/>
    </div>
</template>

<script>
    export default {
        props: ["selectedAddress"],
        components: coms(["SelectedAddress", "NativeBalance", "TxForm"])
    }
</script>
