export function stripRenderFn(entryWithRender) {
	const { render, ...entry } = entryWithRender;
	return entry;
}

export function stripAllRenderFn(collection = []) {
	return collection.map(stripRenderFn);
}
