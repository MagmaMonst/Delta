import express from "express";
import cors from "cors";
import {Server as socketIO_Server} from "socket.io";
import {createServer as HTTP_createServer} from "node:http";
const corsOptions = {
    origin : ["http://localhost:5173"]
};

const app = express();
const server = HTTP_createServer(app);
const io = new socketIO_Server(server);

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
    res.send("Annoying chat app!");
})

app.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});