import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server as socketIO_Server } from "socket.io";
import { createServer as HTTP_createServer } from "node:http";
import dotenv from "dotenv";
import { initializeApp as f_initializeApp } from "firebase/app";
import { getFirestore as f_getFirestore } from "firebase/firestore";
import { addUser, validateUser, getUser, getUserDocRef } from "./User.js";
import jwt from "jsonwebtoken";

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

const app = express();
const server = HTTP_createServer(app);
const io = new socketIO_Server(server);

// for processing bodies in http requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
	origin: ["http://localhost:5173"]
};
app.use(cors(corsOptions));

app.post("/createuser", async (req, res) => {
	// add username and hashed password to database
	if (req.body && req.body.username && req.body.password) {
		let { added, msg } = await addUser(db, req.body.username, req.body.password);
		if (added) {
			res.status(200).send({ added: true, msg: msg });
		} else {
			res.status(400).send({ added: false, msg: msg });
		}
	} else {
		res.status(400).json({ added: false, msg: "Invalid request, please provide username and password fields in request body" });
	}
});

app.post("/authenticateuser", async (req, res) => {
	if (req.body && req.body.username && req.body.password) {
		// check if user has provided correct credentials from database
		const username = req.body.username;
		const password = req.body.password;
		console.log(username);
		const { valid, msg } = await validateUser(db, username, password);
		// if yes, provide an authentication token thingy (JWT)
		if (valid) {
			const data = {
				time: Date.now(),
				username: username,
			};
			const token = jwt.sign(data, process.env.JWT_SECRET_KEY);
			res.status(200).json({ token: token, msg: "here's your token :)" });
		} else {
			res.status(401).json({ token: null, msg: msg });
		}
	} else {
		res.status(400).json({ added: false, msg: "Invalid request, please provide username and password fields in request body" });
	}
});

const tokenMaxLifespan = 1000 * 60 * 60 * 24 * 30; // 30 days

app.get("/secureendpoint", async (req, res) => {
	// validate the token
	const token = req.headers.jwt;
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
		if(verified.username && verified.time) {
			const tokenLife = Date.now() - verified.time;
			if(tokenLife < 0) {
				res.status(401).json({authorized: false, msg: "It appears you are a time traveller. The server sends its deepest apologies, but it lacks the ability to cater to your needs. Sorry!"});
			} else if(tokenLife > tokenMaxLifespan) {
				res.status(401).json({authorized: false, msg: "Token expired, sorry. Sign in again to get a new one"});
			} else {
				const userID = verified.userID;
				const user = await getUser(getUserDocRef(db, verified.username));
				res.status(200).json({authorized: true, msg: `Congrats! You, ${user.username}, are authorized to recieve data...if only we had any data for you. But we do know your password hash is ${user.password}`});
			}
		} else {
			res.status(401).json({authorized: false, msg: "Invalid token sent. Try signing in again."});
		}
	} catch (e) {
		res.status(401).json({authorized: false, msg: "ERROR: " + e}); // token is wrong?
	}
});

app.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});