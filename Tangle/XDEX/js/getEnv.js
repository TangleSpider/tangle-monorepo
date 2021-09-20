require("dotenv").config();

let getEnv = envVar => {
    return process.env[envVar];
};

module.exports = exports = getEnv;
