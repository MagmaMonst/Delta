import express from "express";
import cors from "cors";
import { Server as socketIO_Server } from "socket.io";
import { createServer as HTTP_createServer } from "node:http";
const corsOptions = {
	origin: ["http://localhost:5173"]
};
import dotenv from "dotenv"
import { initializeApp as f_initializeApp } from "firebase/app";
import { getFirestore as f_getFirestore } from "firebase/firestore";
import { create, readAll } from "./CRUD.js";

dotenv.config();
const firebaseConfig = {
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_BUCKET,
	messagingSenderId: process.env.MESSAGING_SENDER_ID,
	appId: process.env.APP_ID
};

const firebaseApp = f_initializeApp(firebaseConfig);

const db = f_getFirestore(firebaseApp);

create(db, "users", {
	first: "Alan",
	middle: "Mathison",
	last: "Turing",
	born: 1912
});
readAll(db, "users");

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