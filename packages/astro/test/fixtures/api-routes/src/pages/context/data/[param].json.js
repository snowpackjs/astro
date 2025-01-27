
export function getStaticPaths() {
	return [
		{
			params: {
				param: 'one'
			}
		},
		{
			params: {
				param: 'two'
			}
		},
	]
}

export function GET({ params, request }) {
	return new Response(
		JSON.stringify({
			param: params.param,
			pathname: new URL(request.url).pathname
		})
	);
}
