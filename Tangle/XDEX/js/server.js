let bodyParser = require("body-parser");
let express = require("express");
let server = {};
server.app = express();
server.app.use(bodyParser.json());

server.addPostHandler = function (path, handler) {
    server.app.post(path, async (req, res) => {
        handler(req, res);
    });
};

server.app.get('/*', (req, res) => {
    if (req.url == '/') req.url = "/xdex.html";
    res.sendFile(req.url, { root: "." });
});

const PORT = process.env.PORT || 8080;
server.app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}...`);
});

module.exports = exports = server;
