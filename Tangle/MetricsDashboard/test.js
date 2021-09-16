import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let fetch = require("node-fetch");

console.log("0x4bc95007" + '2'.padStart(64, '0'));

fetch("https://mainnet.infura.io/v3/2af7b2057e7d423099b6650e172614cd", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_call",
        params: [{
            to: "0xC7827a6CCc51176A986F05Ec8572244aecE6bf2e",
            data: "0x4bc95007" + '2'.padStart(64, '0')
        }, "latest"],
        id: 0
    })
})
.then(response => {
    return response.json();
})
.then(response => {
    console.log(response)
});
