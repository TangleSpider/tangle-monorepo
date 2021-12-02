let xdex = require("xdex");
let http = require("http");
let fs = require("fs");
let ethers = require("ethers");
let { Wallet } = ethers;
let chains = require("chains");
let abis = require("abis");

let env = JSON.parse(fs.readFileSync(".env", "utf8"));
let options = {
    host: "127.0.0.1",
    port: "8000",
    path: "/",
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    }
};
let ping = () => {
    return new Promise((resolve, reject) => {
        let req = http.request(options, res => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(data)
            });
        });
        req.write(JSON.stringify({
            method: "ping"
        }));
        req.end();
    });
};
let xdexRequest = () => {
    return new Promise((resolve, reject) => {
        let req = http.request(options, res => {
            let data = "";
            res.setEncoding("utf8");
            res.on("data", chunk => {
                data += chunk;
            });
            res.on("end", () => {
                resolve(data)
            });
        });
        let logs14 = fs.readFileSync("geth/14/logs", "utf8");
        let logs15 = fs.readFileSync("geth/15/logs", "utf8");
        req.write(JSON.stringify({
            method: "addLiquidity",
            chains: [
                "0x" + "e".padStart(64, '0'),
                "0x" + "f".padStart(64, '0')
            ],
            tokens: [
                logs14.match(/wethaddress:([\d\w]+)/)[1],
                logs15.match(/wethaddress:([\d\w]+)/)[1]
            ],
            amountsDesired: [
                "1000000000",
                "2500000000"
            ],
            msgSender: "0x9De2b19dEaDBeeFB821D00c39289919DD5313566"
        }));
        req.end();
    });
}
(async () => {

    // LOOP TRY GET WETH ADDRESS
    // LOOP TRY GET WETH,PAYER,XDEX APPROVAL > 0
    // LOOP TRY GET WETH,PAYER BALANCE > 0
    // DO REST

    /*let response = JSON.parse(await xdexRequest());
    console.log(response);
    let { chain, amount, id } = response;
    let payer = new Wallet(env.keys.payer, chains[chain].provider);
    let TangleRelayerContract = new ethers.Contract(
        chains[chain].TangleRelayerContract,
        abis.TangleRelayerContract,
        payer
    );
    let overrides = {
        value: amount
    };
    let tx = await TangleRelayerContract.makePayment(
        0,
        id,
        overrides
    );
    console.log("TX", tx);*/
})();
