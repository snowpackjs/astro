import { createSignal } from 'solid-js';

/** a counter written with Solid */
export default function SolidCounter({ children, id }) {
	const [count, setCount] = createSignal(0);
	const add = () => setCount(count() + 1);
	const subtract = () => setCount(count() - 1);

	return (
			<div id={id} class="counter">
				<button class="decrement" onClick={subtract}>-</button>
				<pre>{count()}</pre>
				<button class="increment" onClick={add}>+</button>
				<div class="children">{children}</div>
			</div>
	);
}
