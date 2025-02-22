import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';

function Message({ count }) {
	const [message, setMessage] = useState(null);

	async function fetchAPI() {
		const response = await axios.get(`http://localhost:3000/api?count=${count}`);
		return response;
	};

	useEffect(() => {
		fetchAPI().then(result => {
			setMessage(result.data);
		});
	}, [count]);

	if(message === null) {
		return <p>No messages from server!</p>;
	}else {
		return <p>Message from server: {message}</p>;
	}
}

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount((count) => count + 1)}>
					count is {count}
				</button>
				<Message count={count}></Message>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	)
}

export default App
