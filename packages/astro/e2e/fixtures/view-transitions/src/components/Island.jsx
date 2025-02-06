import React, { useState } from 'react';
import './Island.css';
import { indirect} from './css.js';

export default function Counter({ children, count: initialCount, id, page }) {
	const [count, setCount] = useState(initialCount);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);

	return (
		<>
			<div id={id} className="counter">
				<h1 className="page">{page}</h1>
				<button className="decrement" onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button className="increment" onClick={add}>+</button>
			</div>
			<div className="counter-message">{children}</div>
		</>
	);
}
