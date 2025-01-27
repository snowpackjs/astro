import { useSpecialState } from '@test/react-lib'

export default function Counter({ children }) {
	const [count, setCount] = useSpecialState(0);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);

	return (
		<>
			<div class="counter">
				<button onClick={subtract}>-</button>
				<pre id="counter-text">{count}</pre>
				<button onClick={add}>+</button>
			</div>
			<div class="counter-message">{children}</div>
		</>
	);
}
