import 'astro';

export function Test({ case: id, ...slots }) {
	return <div id={id}>{Object.values(slots)}</div>
}
