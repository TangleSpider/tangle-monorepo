import { createRequire } from 'module';
const require = createRequire(import.meta.url);
let { keccak256 } = require("@ethersproject/keccak256");

let sig = selector => {
    return keccak256(
        "0x" +
        selector.split('').map(c => {
            return c.charCodeAt(0).toString(16);
        }).join('')
    ).substr(0, 10);
};

export { sig };
