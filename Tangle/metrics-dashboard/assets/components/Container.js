Vue.component("container", {
    data() {
        return {
            styleObject: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "60 0",
                color: "#310",
                width: 375,
                overflow: "hidden",
                color: "darkslategrey"
            },
            tHeadStyleObject: {
                textAlign: "right",
                padding: "5px 10px",
                border: "1px solid #0001",
                fontWeight: 600
            },
            tRowStyleObject: {
                textAlign: "right"
            },
            tDataStyleObject: {
                padding: "5px 10px",
                border: "1px solid #0002",
                fontWeight: 600
            },
            tHeaders: [
                { label: "Chain" },
                { label: "Price" },
                { label: "MCap" },
                { label: "Staking APY" }
            ],
            prices: null,
            mcaps: null,
            apys: null
        }
    },
    mounted() {
        let getMetrics = () => {
            fetch(window.location.href.match(/https?:\/\/.*?\//)[0] + "getMetrics", {
                method: "POST"
            })
            .then(response => { return response.json(); })
            .then(response => {
                this.prices = response.prices;
                this.mcaps = response.mcaps;
                this.apys = response.apys;
            });
        };
        getMetrics();
        setInterval(getMetrics, 60 * 1000);
    },
    computed: {
        tRows: function () {
            return ["ETH", "BSC", "FTM", "AVAX", "ARB"].map(a => { return {
                chain: a,
                price: this.prices ? "$" + this.prices[a + "_Price"].toString().substr(0, 8) : "Loading...",
                mcap: this.mcaps ? "$" + this.mcaps[a + "_MCap"] : "Loading...",
                apy: this.apys ? this.apys[a] : "Loading..."
            } });
        },
        currentTotalMCap: function () {
            return this.mcaps ? "Total Market Cap.: $" + this.mcaps.TOTAL_MCap : "Loading...";
        },
        currentAveragePrice: function () {
            return this.mcaps ? "Average Tangle Price: $" + this.prices.AVERAGE_Price : "Loading...";
        }
    },
    template:
        `<div
            :style=styleObject
        >
            <div style="margin-bottom: 5px;font-size:25px; font-weight: 600; font-family: monospace">
                Tangle Metrics Dashboard
            </div>
            <div style="margin-bottom: 2.5px;font-size:18px; font-family: monospace"> {{ currentTotalMCap }} </div>
            <div style="margin-bottom: 7.5px;font-size:18px; font-family: monospace"> {{ currentAveragePrice }} </div>
            <table style="border-spacing: 2px; border: 1px solid #0002; font-size: 110%; font-family: monospace">
                <thead>
                    <th
                        v-for="tHeader in tHeaders"
                        v-key="tHeader.label"
                        colspan="1"
                        :style=tHeadStyleObject
                    >
                        {{ tHeader.label }}
                    </th>
                </thead>
                <tbody>
                    <tr
                        v-for="tRow in tRows"
                        v-key="tRow.chain"
                        :style=tRowStyleObject
                    >
                        <td :style=tDataStyleObject> {{ tRow.chain }} </td>
                        <td :style=tDataStyleObject> {{ tRow.price }} </td>
                        <td :style=tDataStyleObject> {{ tRow.mcap }} </td>
                        <td :style=tDataStyleObject> {{ tRow.apy }} </td>
                    </tr>
                </tbody>
            </table>
        </div>`
});

export default {}
