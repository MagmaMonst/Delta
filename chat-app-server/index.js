import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Server as socketIO_Server } from "socket.io";
import { createServer as HTTP_createServer } from "node:http";
import dotenv from "dotenv";
import { initializeApp as f_initializeApp } from "firebase/app";
import { getFirestore as f_getFirestore } from "firebase/firestore";
import { addUser, validateUser, getUserDocRef, getUser, createRoom, addUserToRoom, acceptRoomAddRequest, getRoomRef, getRoomID } from "./User.js";
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

const tokenMaxLifespan = 1000 * 60 * 60 * 24 * 30; // 30 days
async function validateToken(token) {
	// validate the token
	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
		if (verified.username && verified.time) {
			const tokenLife = Date.now() - verified.time;
			if (tokenLife < 0) {
				return {
					status: 401,
					json: { authorized: false, msg: "It appears you are a time traveller. The server sends its deepest apologies, but it lacks the ability to cater to your needs. Sorry!" }
				};
			} else if (tokenLife > tokenMaxLifespan) {
				return {
					status: 401,
					json: { authorized: false, msg: "Token expired, sorry. Sign in again to get a new one" }
				};

			} else {
				return {
					status: 200,
					json: { authorized: true, msg: "Authorized!" },
					token: verified
				};
			}
		} else {
			return {
				status: 401,
				json: { authorized: false, msg: "Invalid token sent. Try signing in again." }
			};
		}
	} catch (e) {
		return {
			status: 401,
			json: { authorized: false, msg: "ERROR: " + e }
		};
	}
}

let onlineUserSockets = {}; // for each user online, their socket
function isUserOnline(username) {
	return onlineUserSockets[username] !== undefined;
}
function notifyUserToUpdate(username) {
	if (isUserOnline(username)) {
		onlineUserSockets[username].emit("update");
	}
}

function isAlphanumericWithUnderscore(str) {
	const regex = /^[a-zA-Z0-9_]+$/;
	return regex.test(str);
}

app.post("/createuser", async (req, res) => {
	// add username and hashed password to database
	if (req.body && req.body.username && req.body.password) {
		if (isAlphanumericWithUnderscore(req.body.username)) {
			let { added, msg } = await addUser(db, req.body.username, req.body.password);
			if (added) {
				res.status(200).send({ added: true, msg: msg });
			} else {
				res.status(400).send({ added: false, msg: msg });
			}
		} else {
			res.status(400).json({ added: false, msg: "Username may only contain alphabets, numerals or underscores." });
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

app.post("/createroom", async (req, res) => {
	if (req.headers && req.headers.jwt && req.body && req.body.roomName) {
		const token = req.headers.jwt;
		const roomName = req.body.roomName;

		const validationResult = await validateToken(token);
		if (validationResult.status === 200) {
			const parsedToken = validationResult.token;
			const username = parsedToken.username;

			const newRoom = await createRoom(db, roomName);
			const addStatus = await addUserToRoom(db, username, newRoom);
			if (!addStatus.added) {
				res.status(400).json({ created: false, msg: addStatus.msg });
			} else {
				const acceptStatus = await acceptRoomAddRequest(db, username, newRoom);
				if (!acceptStatus.success) {
					res.status(400).json({ created: false, msg: acceptStatus.msg });
				} else {
					res.status(200).json({ created: true, msg: "Successfully created room!" });
				}
			}
		} else {
			res.status(validationResult.status).json(validationResult.json);
		}
	} else {
		res.status(400).json({ created: false, msg: "Invalid request sent" });
	}
});

app.post("/adduser", async (req, res) => {
	if (req.headers && req.headers.jwt && req.body && req.body.roomID && req.body.userToAdd) {
		// req.body.users is a comma-separated list of users to add
		const token = req.headers.jwt;
		const userToAdd = req.body.userToAdd;
		const roomID = req.body.roomID;

		const validationResult = await validateToken(token);
		if (validationResult.status === 200) {
			const parsedToken = validationResult.token;
			const username = parsedToken.username;
			const userRef = getUserDocRef(db, username);
			const user = await getUser(userRef);
			const roomRef = getRoomRef(db, roomID);

			if (user.rooms && user.rooms.includes(roomID)) { // no, it includes only ids
				const addStatus = await addUserToRoom(db, userToAdd, roomRef); // todo: fix bug, ths shd be a ref to room, not name
				if (!addStatus.added) {
					res.status(400).json({ requested: false, msg: addStatus.msg });
				} else {
					notifyUserToUpdate(userToAdd);
					res.status(200).json({ requested: true, msg: "successfully requested user to join room" });
				}
			} else {
				res.status(400).json({ requested: false, msg: "You cannot request people to join a room you are not in" });
			}
		} else {
			res.status(validationResult.status).json(validationResult.json);
		}
	} else {
		res.status(400).json({ requested: false, msg: "Invalid request sent" });
	}
});

app.post("/acceptjoinrequest", async (req, res) => {
	if (req.headers && req.headers.jwt && req.body && req.body.roomID) {
		// req.body.users is a comma-separated list of users to add
		const token = req.headers.jwt;
		const roomID = req.body.roomID;

		const validationResult = await validateToken(token);
		if (validationResult.status === 200) {
			const parsedToken = validationResult.token;
			const username = parsedToken.username;
			const roomRef = getRoomRef(db, roomID);
			const acceptStatus = await acceptRoomAddRequest(db, username, roomRef);
			if(!acceptStatus.success) {
				res.status(400).send({ accepted: false, msg: acceptStatus.msg});
			} else {
				notifyUserToUpdate(username);
				res.status(200).send({accepted: true, msg: acceptStatus.msg});
			}
		} else {
			res.status(validationResult.status).json(validationResult.json);
		}
	} else {
		res.status(400).json({ accepted: false, msg: "Invalid request sent" });
	}
});

io.on("connection", (socket) => {
	console.log(`socket ${socket.id} connected`);
	let userData = {
		userVerified: false
	};
	io.on("validate-token", async (jwt, callback) => {
		const validationResult = await validateToken(jwt);
		if (validationResult.status === 200) {

			userData.userVerified = false;
			userData.username = validationResult.token.username;


			callback({
				valid: true,
				msg: validationResult.msg,
				userData: userData
			});
		} else {
			callback({
				valid: false,
				msg: validationResult.msg
			});
		}
	});
});

app.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});