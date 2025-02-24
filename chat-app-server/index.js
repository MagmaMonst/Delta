import express from "express";
import cors from "cors";
import { Server as socketIO_Server } from "socket.io";
import { createServer as HTTP_createServer } from "node:http";
import dotenv from "dotenv";
import { initializeApp as f_initializeApp } from "firebase/app";
import { getFirestore as f_getFirestore } from "firebase/firestore";
import { addUser } from "./User.js";

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



addUser(db, "user-8", "weakpassword").then((userDocRef) => {
	console.log(userDocRef);
});

const app = express();
const server = HTTP_createServer(app);
const io = new socketIO_Server(server);

const corsOptions = {
	origin: ["http://localhost:5173"]
};
app.use(cors(corsOptions));

app.post("/createuser", (req, res) => {
	// add username and hashed password to database
});

app.post("/authenticateuser", (req, res) => {
	// check if user has provided correct credentials from database
	// if yes, provide an authentication token thingy (JWT)
});

app.get("/secureendpoint", (req, res) => {
	// validate the token
	// if it is valid, send data
});

app.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});