
export default function() {
	return {
		name: 'renderer-one',
		hooks: {
			'astro:config:setup': ({ addRenderer }) => {
				addRenderer({
					name: 'renderer-one',
					clientEntrypoint: null,
					serverEntrypoint: '@test/astro-renderer-one/server.mjs',
				});
			}
		}
	};
}
