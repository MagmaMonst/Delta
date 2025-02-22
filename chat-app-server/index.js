import express from "express";
import cors from "cors";
import {Server as socketIO_Server} from "socket.io";
import {createServer as HTTP_createServer} from "node:http";
const corsOptions = {
    origin : ["http://localhost:5173"]
};
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firbase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import{ useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
    apiKey: "AIzaSyAOAsdKNfIEWRa4ivzO0OBG9pA7IsFM7mc",
  authDomain: "delta-3036e.firebaseapp.com",
  projectId: "delta-3036e",
  storageBucket: "delta-3036e.firebasestorage.app",
  messagingSenderId: "990237578461",
  appId: "1:990237578461:web:125a42bd8ea92cee6a7734",
  measurementId: "G-E5RPEM2ENP"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const [user] = useAuthState(auth);

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

return(
    <div className = "app">
        <header>

        </header>

        <section>
            {user ? <ChatRoom />:<SignIn />}
        </section>
        </div>
);

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    }
    return(
        <button onClick = {signInWithGoogle}>Sign In</button>
    )
}