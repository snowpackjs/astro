/** @jsxImportSource preact */

import { useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

/** A counter written with Preact */
export function PreactCounter({ children }: { children?: ComponentChildren }) {
	const [count, setCount] = useState(0);
	const add = () => setCount((i) => i + 1);
	const subtract = () => setCount((i) => i - 1);

	return (
		<>
			<div class="counter">
				<button onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button onClick={add}>+</button>
			</div>
			<div class="counter-message">{children}</div>
		</>
	);
}
