import { createSignal } from 'solid-js';
import './Counter.css';

export default function Counter({ children, id, count: initialCount = 0 }) {
	const [count, setCount] = createSignal(initialCount);
	const add = () => setCount(count() + 1);
	const subtract = () => setCount(count() - 1);

	return (
		<>
			<div id={id} class="counter">
				<button class="decrement" onClick={subtract}>-</button>
				<pre>{count()}</pre>
				<button class="increment" onClick={add}>+</button>
			</div>
			<div class="counter-message">{children}</div>
		</>
	);
}
