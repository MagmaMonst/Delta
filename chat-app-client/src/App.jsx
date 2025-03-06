import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import axios from 'axios'
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
	transports: ['websocket'],
	autoConnect: false
});

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const manageLogin = async () => {

		try {
			const response = await axios.post('http://localhost:3000/authenticateuser', { username: '', password: '' });
			const { token } = response.data;
			localStorage.setItem('jwtToken', token);

		} catch (error) {
			console.error('Login failed: ', error.response?.data?.message || error.message);
		}
	};
}

function LoginForm({ setJWT }) {
	const [isLogin, setIsLogin] = useState(true);
	const [errMsg, setErrMsg] = useState(null);
	const username = useRef();
	const password = useRef();

	return (
		<div id="login-form-container">
			<h3>{isLogin ? "Login" : "Signup"}</h3>
			<p id="switch-auth-mode" onClick={() => { setIsLogin(!isLogin) }}>{isLogin ? "Create a new account" : "Sign into an existing account"}</p>
			{errMsg === null ? <></> : <p id="login-err">{errMsg}</p>}
			<input type="text" ref={username} placeholder="username"></input>
			<input type="password" ref={password} placeholder="password"></input>
			<button onClick={async () => {
				if (isLogin) {
					try {
						const JWT = await axios.post("http://localhost:3000/authenticateuser", {
							username: username.current.value,
							password: password.current.value
						});
						setErrMsg(null);
						setJWT(JWT.data.token);
					} catch (e) {
						setErrMsg(e.response.data.msg);
					}
				} else {
					try {
						await axios.post("http://localhost:3000/createuser", {
							username: username.current.value,
							password: password.current.value
						});
						const JWT = await axios.post("http://localhost:3000/authenticateuser", {
							username: username.current.value,
							password: password.current.value
						});
						setErrMsg(null);
						setJWT(JWT.data.token);
					} catch (e) {
						setErrMsg(e.response.data.msg);
					}
				}
			}}>Submit</button>
		</div>
	);
}

// todo: a name and timestapm!!
//aheaheahhaahhhhhhhhhghhhghghh help

function ChatMessage({ sender, text }) {
	return <div className="message">Message by {sender}: {text}</div>;
}

function ChatUI({ JWT, changeAppState }) {
	let msgList = [];
	useEffect(() => {
		function updateNotifListener () {
			socket.emit("fetch-data", JWT, (data) => {
				console.log(data);
			});
		}
		socket.on("update", updateNotifListener);
		socket.emit("fetch-data", JWT, (data) => {
			console.log(data);
		});
		return () => {
			socket.off(updateNotifListener);
		}
	});
	return (<>
		<div className="chat-box">
			<div className="message-display">

			</div>
			<div className="input-background">
				<input type="text" className="message-input" placeholder="Type a message here"></input>
				<button className="send">Send</button>
			</div>
		</div>
	</>);
}

function App() {
	const [count, setCount] = useState(0);
	const [JWT, setJWT] = useState(localStorage.getItem("jwt"));
	const [isInLoginState, changeAppState] = useState(JWT === null);

	useEffect(() => {
		if (isInLoginState) {
			socket.disconnect();
		} else {
			socket.connect();
		}
		return () => {
			socket.disconnect();
		};
	}, [isInLoginState]);

	if (isInLoginState) {
		return <LoginForm setJWT={(newJWT) => {
			localStorage.setItem("jwt", newJWT);
			setJWT(newJWT);
			if (newJWT !== null) {
				changeAppState(false);
			}
		}}></LoginForm>
	} else {
		return <ChatUI JWT={JWT} changeAppState={changeAppState}></ChatUI>;
	}
}

export default App;