import {createSignal} from "solid-js";

export default function Counter(props) {
	const [count, setCount] = createSignal(0);
	const add = () => setCount(count() + 1);
	const subtract = () => setCount(count() - 1);

	return (
		<>
			<div class="counter">
				<button onClick={subtract} class="decrement">-</button>

				<pre>{props.prefix ?? ''}{count()}{props.postfix ?? ""}</pre>
				<button onClick={add} class="increment">+</button>
			</div>
			<div class="counter-message">{props.children}</div>
		</>
	);
}
