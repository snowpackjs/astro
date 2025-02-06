import type { ComponentChildren } from 'preact';
import type { Signal } from '@preact/signals';
import { lazy, Suspense } from 'preact/compat';
import './Counter.css';

const Message = lazy(async () => import('./Message'));
const Fallback = () => <p>Loading...</p>;

type Props = {
	children: ComponentChildren;
	count: Signal<number>;
};

export default function Counter({ children, count }: Props) {
	const add = () => count.value++;
	const subtract = () => count.value--;

	return (
		<>
			<div class="counter">
				<button onClick={subtract}>-</button>
				<pre>{count}</pre>
				<button onClick={add}>+</button>
			</div>
			<Suspense fallback={Fallback}>
				<Message>{children}</Message>
			</Suspense>
		</>
	);
}
