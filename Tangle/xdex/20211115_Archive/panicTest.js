let keccak256 = require("@ethersproject/keccak256").keccak256;

let leaf = keccak256("0x02");
let proof = [keccak256("0x03"), keccak256("0x01")];
let root = "[REDACTED]2b";
let index = 0;

let hash = leaf;
for (let i = 0; i < proof.length; i++) {
    if (index % 2 == 0) {
        hash = keccak256(hash + proof[i].substr(2));
    } else {
        hash = keccak256(proof[i] + hash.substr(2));
    }
    index /= 2;
}
console.log(hash);

let hash2 = keccak256("0x02");
let hash3 = keccak256("0x03");
let hash1 = keccak256("0x01");
let hash0 = keccak256(hash2 + hash3.substr(2));
console.log(keccak256(hash0 + hash1.substr(2)));
