<template>
    <div>
        Chain: <span>{{ ntoa(chainId) }}</span>
    </div>
</template>

<script>
    export default {
        mounted() {
            ethereum.on("chainChanged", () => {
                this.chainId = ethereum.chainId
            });
            ethereum.emit("chainChanged");
        },
        methods: {
            ntoa(v) {
                switch (v) {
                    case "0x1": return "Ethereum";
                    case "0x38": return "Binance Smart Chain";
                    case "0x61": return "Binance Smart Chain Testnet";
                    case "0xfa": return "Fantom";
                    case "0xa4b1": return "Arbitrum";
                    case "0xa869": return "Avalanche Testnet";
                    case "0xa86a": return "Avalanche";
                    case null: return '~';
                    default: return v;
                }
            }
        },
        data() {
            return {
                chainId: null,
            }
        }
    }
</script>
