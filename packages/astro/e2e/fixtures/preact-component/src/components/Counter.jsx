import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import './Counter.css';

export default function Counter({ children, count: initialCount, id }) {
	const [count, setCount] = useState(initialCount);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);

	return (
		<>
			<div id={id} className="counter">
				<button className="decrement" onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button className="increment" onClick={add}>+</button>
			</div>
			<div className="counter-message">{children}</div>
		</>
	);
}
