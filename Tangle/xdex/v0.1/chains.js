let ethers = require("ethers");
let fs = require("fs");
let logs14 = fs.readFileSync("/code/XDEX/geth/14/logs", "utf8");
let logs15 = fs.readFileSync("/code/XDEX/geth/15/logs", "utf8");
let trcAddress14 = logs14.match(/trcaddress:([\d\w]+)/)[1];
let trcAddress15 = logs15.match(/trcaddress:([\d\w]+)/)[1];

let chains = {
    ["0x" + "61".padStart(64, '0')]: { // BSC
        name: "BSC_Test",
        TangleRelayerContract: "0xA509CA4CF5E05B1e2178B1a9Ade08e05374C64af",
        TangleRelayer: "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5",
        rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        filterChunkSize: 0
    },
    ["0x" + "a869".padStart(64, '0')]: { // AVAX
        name: "AVAX_Test",
        TangleRelayerContract: "0x3835Eb64fe65B7a3d85d110152ecaF547A919ca3",
        TangleRelayer: "0xB6c861d9A22b5DB61B485167685324fD2E6dfBE5",
        rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
        filterChunkSize: 0
    },
    ["0x" + "e".padStart(64, '0')]: { // + P14
        name: "P14",
        TangleRelayerContract: trcAddress14,
        TangleRelayer: "0x685d9b9b070a5e79c53FC3d511cbBf46585Ef978",
        rpcUrl: "http://127.0.0.1:8014/",
        filterChunkSize: 5000
    },
    ["0x" + "f".padStart(64, '0')]: { // + P15
        name: "P15",
        TangleRelayerContract: trcAddress15,
        TangleRelayer: "0x685d9b9b070a5e79c53FC3d511cbBf46585Ef978",
        rpcUrl: "http://127.0.0.1:8015/",
        filterChunkSize: 1
    }
};

Object.entries(chains).map(async chain => {
    chains[chain[0]].shortId = chain[0].replace(/0+(?!x|$)/, "");
    chains[chain[0]].longId = chain[0];
    chains[chain[0]].filters = {
        paymentReceived: {
            address: chains[chain[0]].TangleRelayerContract,
            topics: [ethers.utils.id(
                "PaymentReceived(uint256,uint256,uint256)"
            )]
        }
    };
    chains[chain[0]].provider = new ethers.getDefaultProvider(chains[chain[0]].rpcUrl);
    module.exports = chains;
});
