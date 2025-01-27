import { defineDbIntegration } from '@astrojs/db/utils';

export default function testIntegration() {
	return defineDbIntegration({
		name: 'db-test-integration',
		hooks: {
			'astro:db:setup'({ extendDb }) {
				extendDb({
					configEntrypoint: './integration/config.ts',
					seedEntrypoint: './integration/seed.ts',
				});
			},
		},
	});
}
