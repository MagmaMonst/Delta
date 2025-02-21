import express from "express";
import {Server as socketIO_Server} from "socket.io";
import {createServer as HTTP_createServer} from "node:http";

const app = express();
const server = HTTP_createServer(app);
const io = new socketIO_Server(server);

app.get("/", (req, res) => {
    res.send("Hello, world!");
})

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});