<template>
    <div>
        <SelectedAddress :selectedAddress="selectedAddress"/>
        <NativeBalance :selectedAddress="selectedAddress"/>
        <TxForm />
    </div>
</template>

<script>
    export default {
        props: ["selectedAddress"],
        components: aComs([
            "SelectedAddress",
            "NativeBalance",
            "TxForm"
        ], "/Web3/ProviderExistent/GateKeeper/ProviderConnected")
    }
</script>
