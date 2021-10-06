import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require("dotenv").config();

let getEnv = envVar => {
    return process.env[envVar];
};

export { getEnv };
