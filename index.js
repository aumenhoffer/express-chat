//Nuntius

global.__root = __dirname;
global.config = require("./config.json");

//Import modules
const express = require('express');
const http = require("http")
const HTMLRouter = require("./src/router/html");
const WSRouter = require("./src/router/ws");

const app = express();
const server = http.createServer(app);

app.get("/crash", (req, res) => {
	process.exit();
})

//Express Routing
app.all("*", HTMLRouter);

//Websockets
WSRouter(server);

server.listen(require("./config.json").port, () => console.log(`Server listening`));
