export const GET: APIRoute = async ({ params }) => {
	const { lang } = params;

	return new Response(`I'm a route in the "${lang}" language.`);
};

export async function getStaticPaths() {
	return ['it', 'en'].map((language) => {
		return {
			params: {
				lang: language,
			},
		};
	});
}
