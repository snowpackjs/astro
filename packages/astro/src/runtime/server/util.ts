export function isPromise<T = any>(value: any): value is Promise<T> {
	return (
		!!value && typeof value === 'object' && 'then' in value && typeof value.then === 'function'
	);
}

export async function* streamAsyncIterator(stream: ReadableStream) {
	const reader = stream.getReader();

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) return;
			yield value;
		}
	} finally {
		reader.releaseLock();
	}
}
