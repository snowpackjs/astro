import { useState } from 'react';

/** a counter written in React */
export function Counter({ children, id }) {
	const [count, setCount] = useState(0);
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
