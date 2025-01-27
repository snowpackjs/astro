import { Fragment, h } from 'preact';
import { Suspense, lazy } from 'preact/compat';
import { useState } from 'preact/hooks';
import './Counter.css';

const LazyCounterMessage = lazy(() => import('./CounterMessage'))

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
			<Suspense fallback={<p>Load message...</p>}>
				<LazyCounterMessage className="counter-message">{children}</LazyCounterMessage>
			</Suspense>
		</>
	);
}
