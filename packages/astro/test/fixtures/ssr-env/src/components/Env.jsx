
export default function() {
	const ssr = import.meta.env.SSR;
	return (
		<div id="ssr">{'' + ssr }</div>
	)
}
