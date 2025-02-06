import { ErrorBoundary, Show, createResource, createSignal, createUniqueId } from 'solid-js';

// It may be good to try short and long sleep times.
// But short is faster for testing.
const SLEEP_MS = 10;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function AsyncComponent(props) {
	const id = createUniqueId();

	const [data] = createResource(async () => {
		// console.log("Start rendering async component " + props.title);
		await sleep(props.delay ?? SLEEP_MS);
		// console.log("Finish rendering async component " + props.title);
		return 'Async result for component id=' + id;
	});

	const [show, setShow] = createSignal(false);

	return (
		<div data-name="AsyncComponent" style={{ border: 'black solid 1px', padding: '4px' }}>
			{'title=' + (props.title ?? '(none)') + ' '}
			{'id=' + id + ' '}
			<span>{data()}</span>{' '}
			<button
				type="button"
				disabled={show()}
				onClick={() => {
					setShow(true);
				}}
			>
				Show children
			</button>
			{/* NOTE: The props.children are intentionally hidden by default 
		      to simulate a situation where hydration script might not 
					be injected in the right spot. */}
			<Show when={show()}>{props.children ?? 'Empty'}</Show>
		</div>
	);
}

export function AsyncErrorComponent() {
	const [data] = createResource(async () => {
		await sleep(SLEEP_MS);
		throw new Error('Async error thrown!');
	});

	return <div>{data()}</div>;
}

export function AsyncErrorInErrorBoundary() {
	return (
		<ErrorBoundary fallback={<div>Async error boundary fallback</div>}>
			<AsyncErrorComponent />
		</ErrorBoundary>
	);
}

export function SyncErrorComponent() {
	throw new Error('Sync error thrown!');
}

export function SyncErrorInErrorBoundary() {
	return (
		<ErrorBoundary fallback={<div>Sync error boundary fallback</div>}>
			<SyncErrorComponent />
		</ErrorBoundary>
	);
}
