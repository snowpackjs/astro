import { useState } from 'react';

/** a counter written in React */
export default function Counter({ children, id }) {
	const [count, setCount] = useState(0);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);

	return (
		<div id={id} className="counter">
			<button className="decrement" onClick={subtract}>-</button>
			<pre id={`${id}-count`}>{count}</pre>
			<button id={`${id}-increment`} className="increment" onClick={add}>+</button>
			<div className="children">{children}</div>
		</div>
	);
}
