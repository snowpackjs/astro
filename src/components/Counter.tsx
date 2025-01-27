import { createSignal, type JSX } from 'solid-js';
import './Counter.css';

export default function Counter(props: { children?: JSX.Element }) {
	const [count, setCount] = createSignal(0);
	const add = () => setCount(count() + 1);
	const subtract = () => setCount(count() - 1);

	return (
		<>
			<div class="counter">
				<button onClick={subtract}>-</button>
				<pre>{count()}</pre>
				<button onClick={add}>+</button>
			</div>
			<div class="counter-message">{props.children}</div>
		</>
	);
}
