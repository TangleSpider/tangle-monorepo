<template>
    <ConnectionMenu
        :selectedAddress="selectedAddress"
        :autoconnect="autoconnect"
    />
    <ProviderConnected
        v-if="selectedAddress"
        :selectedAddress="selectedAddress"
    />
</template>

<script>
    export default {
        mounted() {
            ethereum.on("accountsChanged", addresses => {
                if (!addresses[0]) this.autoconnectSetFalsy();
                this.selectedAddress = addresses[0];
            });
            ethereum.on("connectRequest", () =>
                ethereum.request({ method: "eth_requestAccounts" })
                .then(addresses => this.selectedAddress = addresses[0])
                .catch(this.autoconnectSetFalsy)
            );
            ethereum.on("autoconnectChanged", event => {
                this.autoconnect = event.target.value;
                localStorage.autoconnect = this.autoconnect;
                if (this.autoconnect) ethereum.emit("connectRequest");
            });
            if (localStorage.autoconnect) ethereum.emit("connectRequest");
        },
        methods: {
            autoconnectSetFalsy() {
                ethereum.emit("autoconnectChanged", { target: { value: "" } });
            }
        },
        data() {
            return {
                selectedAddress: undefined,
                autoconnect: localStorage.autoconnect
            }
        },
        components: coms(["ConnectionMenu", "ProviderConnected"])
    }
</script>
