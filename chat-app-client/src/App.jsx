import React, { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	
	const manageLogin = async () => {

	try {
		const response = await axios.post('http://localhost:3000/authenticateuser', {username: '', password: ''});
		const { token } = response.data;
		localStorage.setItem('jwtToken', token);

	} catch (error) {
		console.error('Login failed: ', error.response?.data?.message || error.message);
	}
};
}


function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<div class="chat-box">
      			<div class="message-display">
        		<div class="message user" >test for messages sent by user</div>
        		<div class="message">test for messages sent by others</div>
      		</div>
      		<div class="input-background">
        		<input type="text" class="message-input" placeholder="Type a message here"></input>
        		<button class="send">Send</button>
      		</div>
    		</div>
		</>
	)
}

export default App
