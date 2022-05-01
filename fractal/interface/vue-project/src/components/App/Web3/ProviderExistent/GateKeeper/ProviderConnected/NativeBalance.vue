<template>
    <div>
        Balance: <span>{{ ntoa(balance) }}</span>
    </div>
</template>

<script>
    export default {
        mounted() {
            ethereum.on("accountsChanged", () => {
                if (ethereum.selectedAddress) this.balanceUpdate();
            });
            ethereum.on("message", () => {
                if (ethereum.selectedAddress) this.balanceUpdate();
            });
            ethereum.on("chainChanged", () => {
                if (ethereum.selectedAddress) this.balanceUpdate();
            });
            this.balanceUpdate();
        },
        methods: {
            balanceUpdate() {
                ethereum.request({
                    method: "eth_getBalance",
                    params: [ethereum.selectedAddress, "latest"]
                }).then(balance => this.balance = balance);
            },
            ntoa(v) { return (v = parseInt(v) / 1e18, isNaN(v) ? '~' : v) }
        },
        data() {
            return {
                balance: null,
            }
        }
    }
</script>
