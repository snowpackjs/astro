import { h } from 'preact';

export default function({ name }) {
	const inTheClient = import.meta.env.SSR ? '' : ' in the client'
	return (
		<div id={name.toLowerCase()}>Hello {name}{inTheClient}</div>
	);
}
