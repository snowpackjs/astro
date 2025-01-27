import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validateConfig } from '../../../dist/core/config/validate.js';
import { MissingLocale } from '../../../dist/core/errors/errors-data.js';
import { AstroError } from '../../../dist/core/errors/index.js';
import {
	getLocaleAbsoluteUrl,
	getLocaleAbsoluteUrlList,
	getLocaleRelativeUrl,
	getLocaleRelativeUrlList,
} from '../../../dist/i18n/index.js';
import { parseLocale, toRoutingStrategy } from '../../../dist/i18n/utils.js';

describe('getLocaleRelativeUrl', () => {
	it('should correctly return the URL with the base', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			base: '/blog',
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: [
						'en',
						'en_US',
						'es',
						{
							path: 'italiano',
							codes: ['it', 'it-VA'],
						},
					],
				},
			},
		};

		// directory format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				trailingSlash: 'always',
				format: 'directory',
				...config.experimental.i18n,
			}),
			'/blog/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'directory',
			}),
			'/blog/es/',
		);

		// file format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'file',
			}),
			'/blog/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'file',
			}),
			'/blog/es/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'it-VA',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'file',
			}),
			'/blog/italiano/',
		);
	});

	it('should correctly return the URL without base', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'es'],
				},
			},
		};

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'directory',
			}),
			'/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'directory',
			}),
			'/es/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/',
				...config.experimental.i18n,
				trailingSlash: 'never',
				format: 'file',
			}),
			'/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/',
				...config.experimental.i18n,
				trailingSlash: 'never',
				format: 'file',
			}),
			'/es',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/',
				...config.experimental.i18n,
				trailingSlash: 'never',
				format: 'directory',
			}),
			'/',
		);
	});

	it('should correctly handle the trailing slash', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			i18n: {
				defaultLocale: 'en',
				locales: [
					'en',
					'es',
					{
						path: 'italiano',
						codes: ['it', 'it-VA'],
					},
				],
			},
		};
		// directory format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog',
				...config.i18n,
				trailingSlash: 'never',
				format: 'directory',
			}),
			'/blog',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'directory',
			}),
			'/blog/es/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'it-VA',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
			}),
			'/blog/italiano/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'ignore',
				format: 'directory',
			}),
			'/blog/',
		);

		// directory file
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog',
				...config.i18n,
				trailingSlash: 'never',
				format: 'file',
			}),
			'/blog',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
			}),
			'/blog/es/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				// ignore + file => no trailing slash
				base: '/blog',
				...config.i18n,
				trailingSlash: 'ignore',
				format: 'file',
			}),
			'/blog',
		);
	});

	it('should normalize locales by default', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			base: '/blog',
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'en_US', 'en_AU'],
			},
		};

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en_US',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'directory',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en-us/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en_US',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'directory',
				normalizeLocale: false,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en_US/',
		);

		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en_AU',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'directory',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en-au/',
		);
	});

	it('should return the default locale when routing strategy is [pathname-prefix-always]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			base: '/blog',
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'es', 'en_US', 'en_AU'],
				routing: {
					prefixDefaultLocale: true,
				},
			},
		};

		// directory format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				trailingSlash: 'always',
				format: 'directory',
				...config.i18n,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'directory',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/es/',
		);

		// file format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/es/',
		);
	});

	it('should return the default locale when routing strategy is [pathname-prefix-always-no-redirect]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			base: '/blog',
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'es', 'en_US', 'en_AU'],
				routing: {
					prefixDefaultLocale: true,
					redirectToDefaultLocale: false,
				},
			},
		};

		// directory format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				trailingSlash: 'always',
				format: 'directory',
				...config.i18n,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'directory',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/es/',
		);

		// file format
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'en',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/en/',
		);
		assert.equal(
			getLocaleRelativeUrl({
				locale: 'es',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			'/blog/es/',
		);
	});
});

describe('getLocaleRelativeUrlList', () => {
	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: never]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: [
						'en',
						'en_US',
						'es',
						{
							path: 'italiano',
							codes: ['it', 'it-VA'],
						},
					],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog',
				...config.experimental.i18n,
				trailingSlash: 'never',
				format: 'directory',
			}),
			['/blog', '/blog/en-us', '/blog/es', '/blog/italiano'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: always]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: [
						'en',
						'en_US',
						'es',
						{
							path: 'italiano',
							codes: ['it', 'it-VA'],
						},
					],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'directory',
			}),
			['/blog/', '/blog/en-us/', '/blog/es/', '/blog/italiano/'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: file, trailingSlash: always]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'always',
				format: 'file',
			}),
			['/blog/', '/blog/en-us/', '/blog/es/'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: file, trailingSlash: never]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog',
				...config.experimental.i18n,
				trailingSlash: 'never',
				format: 'file',
			}),
			['/blog', '/blog/en-us', '/blog/es'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: file, trailingSlash: ignore]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog',
				...config.experimental.i18n,
				trailingSlash: 'ignore',
				format: 'file',
			}),
			['/blog', '/blog/en-us', '/blog/es'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: ignore]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'ignore',
				format: 'directory',
			}),
			['/blog/', '/blog/en-us/', '/blog/es/'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: never, routingStrategy: pathname-prefix-always]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'en_US', 'es'],
				routing: {
					prefixDefaultLocale: true,
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog',
				...config.i18n,
				trailingSlash: 'never',
				format: 'directory',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			['/blog/en', '/blog/en-us', '/blog/es'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: never, routingStrategy: pathname-prefix-always-no-redirect]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'en_US', 'es'],
				routing: {
					prefixDefaultLocale: true,
					redirectToDefaultLocale: false,
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleRelativeUrlList({
				locale: 'en',
				base: '/blog',
				...config.i18n,
				trailingSlash: 'never',
				format: 'directory',
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			['/blog/en', '/blog/en-us', '/blog/es'],
		);
	});
});

describe('getLocaleAbsoluteUrl', () => {
	describe('with [prefix-other-locales]', () => {
		it('should correctly return the URL with the base', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				base: '/blog',
				i18n: {
					defaultLocale: 'en',
					locales: [
						'en',
						'en_US',
						'es',
						{
							path: 'italiano',
							codes: ['it', 'it-VA'],
						},
					],
					domains: {
						es: 'https://es.example.com',
					},
					routingStrategy: 'prefix-other-locales',
				},
			};

			// directory format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					...config.i18n,
				}),
				'https://example.com/blog/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					isBuild: true,
				}),
				'https://es.example.com/blog/',
			);

			assert.throws(
				() =>
					getLocaleAbsoluteUrl({
						locale: 'ff',
						base: '/blog/',
						...config.i18n,
						trailingSlash: 'always',
						format: 'directory',
						site: 'https://example.com',
					}),

				new AstroError({
					...MissingLocale,
					message: MissingLocale.message('ff'),
				}),
			);

			// file format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
				}),
				'https://example.com/blog/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'it-VA',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
				}),
				'https://example.com/blog/italiano/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					isBuild: true,
				}),
				'https://es.example.com/blog/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					prependWith: 'some-name',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					path: 'first-post',
					isBuild: true,
				}),
				'https://es.example.com/blog/some-name/first-post/',
			);

			// en isn't mapped to a domain
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					prependWith: 'some-name',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					path: 'first-post',
					isBuild: true,
				}),
				'https://example.com/blog/some-name/first-post/',
			);
		});
	});
	describe('with [prefix-always]', () => {
		it('should correctly return the URL with the base', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				base: '/blog',
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
					domains: {
						es: 'https://es.example.com',
					},
					routing: {
						prefixDefaultLocale: true,
					},
				},
			};

			// directory format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					...config.i18n,
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);

			// file format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					isBuild: true,
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://es.example.com/blog/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					prependWith: 'some-name',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					path: 'first-post',
					isBuild: true,
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://es.example.com/blog/some-name/first-post/',
			);
		});
		it('should correctly return the URL without base', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'es'],
					routing: {
						prefixDefaultLocale: true,
					},
				},
			};

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/en/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/es/',
			);
		});

		it('should correctly handle the trailing slash', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'es'],
					routing: {
						prefixDefaultLocale: true,
					},
				},
			};
			// directory format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog',
					...config.i18n,
					trailingSlash: 'never',
					format: 'directory',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'ignore',
					format: 'directory',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);

			// directory file
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog',
					...config.i18n,
					trailingSlash: 'never',
					format: 'file',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					// ignore + file => no trailing slash
					base: '/blog',
					...config.i18n,
					trailingSlash: 'ignore',
					format: 'file',
					site: 'https://example.com',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en',
			);
		});

		it('should normalize locales', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				base: '/blog',
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'en_US', 'en_AU'],
						routingStrategy: 'pathname-prefix-always',
					},
				},
			};

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en_US',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
				}),
				'/blog/en-us/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en_AU',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
				}),
				'/blog/en-au/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en_US',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
					normalizeLocale: true,
				}),
				'/blog/en-us/',
			);
		});

		it('should return the default locale when routing strategy is [pathname-prefix-always]', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				base: '/blog',
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'es', 'en_US', 'en_AU'],
					routing: {
						prefixDefaultLocale: true,
					},
				},
			};

			// directory format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					trailingSlash: 'always',
					site: 'https://example.com',
					format: 'directory',
					...config.i18n,
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					site: 'https://example.com',
					trailingSlash: 'always',
					format: 'directory',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);

			// file format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					...config.i18n,
					site: 'https://example.com',
					trailingSlash: 'always',
					format: 'file',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					site: 'https://example.com',
					trailingSlash: 'always',
					format: 'file',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);
		});

		it('should return the default locale when routing strategy is [pathname-prefix-always-no-redirect]', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				base: '/blog',
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'es', 'en_US', 'en_AU'],
					routing: {
						prefixDefaultLocale: true,
						redirectToDefaultLocale: false,
					},
				},
			};

			// directory format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					trailingSlash: 'always',
					site: 'https://example.com',
					format: 'directory',
					...config.i18n,
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					site: 'https://example.com',
					trailingSlash: 'always',
					format: 'directory',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);

			// file format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					...config.i18n,
					site: 'https://example.com',
					trailingSlash: 'always',
					format: 'file',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/en/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.i18n,
					site: 'https://example.com',
					trailingSlash: 'always',
					format: 'file',
					strategy: toRoutingStrategy(config.i18n.routing, {}),
				}),
				'https://example.com/blog/es/',
			);
		});
	});
	describe('with [prefix-other-locales]', () => {
		it('should correctly return the URL without base', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: [
							'en',
							'es',
							{
								path: 'italiano',
								codes: ['it', 'it-VA'],
							},
						],
						routingStrategy: 'prefix-other-locales',
					},
				},
			};

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/es/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'it-VA',
					base: '/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/italiano/',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/',
					...config.experimental.i18n,
					trailingSlash: 'never',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/',
					...config.experimental.i18n,
					trailingSlash: 'never',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/es',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'it-VA',
					base: '/',
					...config.experimental.i18n,
					trailingSlash: 'never',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/italiano',
			);
		});

		it('should correctly handle the trailing slash', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'es'],
						routingStrategy: 'prefix-other-locales',
					},
				},
			};
			// directory format
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog',
					...config.experimental.i18n,
					trailingSlash: 'never',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/blog',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'ignore',
					format: 'directory',
					site: 'https://example.com',
				}),
				'https://example.com/blog/',
			);

			// directory file
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					base: '/blog',
					...config.experimental.i18n,
					trailingSlash: 'never',
					format: 'file',
					site: 'https://example.com',
				}),
				'https://example.com/blog',
			);
			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'es',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'file',
					site: 'https://example.com',
				}),
				'https://example.com/blog/es/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en',
					// ignore + file => no trailing slash
					base: '/blog',
					...config.experimental.i18n,
					trailingSlash: 'ignore',
					format: 'file',
					site: 'https://example.com',
				}),
				'https://example.com/blog',
			);
		});

		it('should normalize locales', () => {
			/**
			 *
			 * @type {import("../../../dist/@types").AstroUserConfig}
			 */
			const config = {
				base: '/blog',
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'en_US', 'en_AU'],
						routingStrategy: 'prefix-other-locales',
					},
				},
			};

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en_US',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
				}),
				'/blog/en-us/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en_AU',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
				}),
				'/blog/en-au/',
			);

			assert.equal(
				getLocaleAbsoluteUrl({
					locale: 'en_US',
					base: '/blog/',
					...config.experimental.i18n,
					trailingSlash: 'always',
					format: 'directory',
					normalizeLocale: true,
				}),
				'/blog/en-us/',
			);
		});
	});
});

describe('getLocaleAbsoluteUrlList', () => {
	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: never]', async () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = await validateConfig(
			{
				trailingSlash: 'never',
				format: 'directory',
				site: 'https://example.com',
				base: '/blog',
				i18n: {
					defaultLocale: 'en',
					locales: [
						'en',
						'en_US',
						'es',
						{
							path: 'italiano',
							codes: ['it', 'it-VA'],
						},
					],
				},
			},
			process.cwd(),
		);
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				...config,
				...config.i18n,
				isBuild: true,
			}),
			[
				'https://example.com/blog',
				'https://example.com/blog/en-us',
				'https://example.com/blog/es',
				'https://example.com/blog/italiano',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: always]', async () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = await validateConfig(
			{
				trailingSlash: 'always',
				format: 'directory',
				base: '/blog/',
				site: 'https://example.com',
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
			process.cwd(),
		);
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				...config,
				...config.i18n,
			}),
			[
				'https://example.com/blog/',
				'https://example.com/blog/en-us/',
				'https://example.com/blog/es/',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales and path [format: directory, trailingSlash: always]', async () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = await validateConfig(
			{
				format: 'directory',
				site: 'https://example.com/',
				trailingSlash: 'always',
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
					routing: {
						prefixDefaultLocale: true,
					},
				},
			},
			process.cwd(),
		);
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				path: 'download',
				...config,
				...config.i18n,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
			}),
			[
				'https://example.com/en/download/',
				'https://example.com/en-us/download/',
				'https://example.com/es/download/',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales and path [format: directory, trailingSlash: always, domains]', async () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = await validateConfig(
			{
				format: 'directory',
				output: 'server',
				site: 'https://example.com/',
				trailingSlash: 'always',
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
					routing: {
						prefixDefaultLocale: true,
					},
					domains: {
						es: 'https://es.example.com',
					},
				},
			},
			process.cwd(),
		);
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				path: 'download',
				...config,
				...config.i18n,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
				isBuild: true,
			}),
			[
				'https://example.com/en/download/',
				'https://example.com/en-us/download/',
				'https://es.example.com/download/',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: file, trailingSlash: always]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			i18n: {
				defaultLocale: 'en',
				locales: [
					'en',
					'en_US',
					'es',
					{
						path: 'italiano',
						codes: ['it', 'it-VA'],
					},
				],
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				base: '/blog/',
				...config.i18n,
				trailingSlash: 'always',
				format: 'file',
				site: 'https://example.com',
			}),
			[
				'https://example.com/blog/',
				'https://example.com/blog/en-us/',
				'https://example.com/blog/es/',
				'https://example.com/blog/italiano/',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: file, trailingSlash: never]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				base: '/blog',
				...config.experimental.i18n,
				trailingSlash: 'never',
				format: 'file',
				site: 'https://example.com',
			}),
			['https://example.com/blog', 'https://example.com/blog/en-us', 'https://example.com/blog/es'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: file, trailingSlash: ignore]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				base: '/blog',
				...config.experimental.i18n,
				trailingSlash: 'ignore',
				format: 'file',
				site: 'https://example.com',
			}),
			['https://example.com/blog', 'https://example.com/blog/en-us', 'https://example.com/blog/es'],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: ignore]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'ignore',
				format: 'directory',
				site: 'https://example.com',
			}),
			[
				'https://example.com/blog/',
				'https://example.com/blog/en-us/',
				'https://example.com/blog/es/',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: ignore,  routingStrategy: pathname-prefix-always]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'en_US', 'es'],
				routing: {
					prefixDefaultLocale: true,
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				base: '/blog/',
				...config.i18n,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
				trailingSlash: 'ignore',
				format: 'directory',
				site: 'https://example.com',
			}),
			[
				'https://example.com/blog/en/',
				'https://example.com/blog/en-us/',
				'https://example.com/blog/es/',
			],
		);
	});

	it('should retrieve the correct list of base URL with locales [format: directory, trailingSlash: ignore,  routingStrategy: pathname-prefix-always-no-redirect]', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			i18n: {
				defaultLocale: 'en',
				locales: ['en', 'en_US', 'es'],
				routing: {
					prefixDefaultLocale: true,
					redirectToDefaultLocale: false,
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				locale: 'en',
				base: '/blog/',
				...config.i18n,
				strategy: toRoutingStrategy(config.i18n.routing, {}),
				trailingSlash: 'ignore',
				format: 'directory',
				site: 'https://example.com',
			}),
			[
				'https://example.com/blog/en/',
				'https://example.com/blog/en-us/',
				'https://example.com/blog/es/',
			],
		);
	});

	it('should retrieve the correct list of base URLs, swapped with the correct domain', () => {
		/**
		 *
		 * @type {import("../../../dist/@types").AstroUserConfig}
		 */
		const config = {
			experimental: {
				i18n: {
					defaultLocale: 'en',
					locales: ['en', 'en_US', 'es'],
					routingStrategy: 'pathname-prefix-always',
					domains: {
						es: 'https://es.example.com',
						en: 'https://example.uk',
					},
				},
			},
		};
		// directory format
		assert.deepEqual(
			getLocaleAbsoluteUrlList({
				base: '/blog/',
				...config.experimental.i18n,
				trailingSlash: 'ignore',
				format: 'directory',
				site: 'https://example.com',
				isBuild: true,
			}),
			[
				'https://example.uk/blog/',
				'https://example.com/blog/en-us/',
				'https://es.example.com/blog/',
			],
		);
	});
});

describe('parse accept-header', () => {
	it('should be parsed correctly', () => {
		assert.deepEqual(parseLocale('*'), [{ locale: '*', qualityValue: undefined }]);
		assert.deepEqual(parseLocale('fr'), [{ locale: 'fr', qualityValue: undefined }]);
		assert.deepEqual(parseLocale('fr;q=0.6'), [{ locale: 'fr', qualityValue: 0.6 }]);
		assert.deepEqual(parseLocale('fr;q=0.6,fr-CA;q=0.5'), [
			{ locale: 'fr', qualityValue: 0.6 },
			{ locale: 'fr-CA', qualityValue: 0.5 },
		]);

		assert.deepEqual(parseLocale('fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'), [
			{ locale: 'fr-CH', qualityValue: undefined },
			{ locale: 'fr', qualityValue: 0.9 },
			{ locale: 'en', qualityValue: 0.8 },
			{ locale: 'de', qualityValue: 0.7 },
			{ locale: '*', qualityValue: 0.5 },
		]);
	});

	it('should not return incorrect quality values', () => {
		assert.deepEqual(parseLocale('wrong'), [{ locale: 'wrong', qualityValue: undefined }]);
		assert.deepEqual(parseLocale('fr;f=0.7'), [{ locale: 'fr', qualityValue: undefined }]);
		assert.deepEqual(parseLocale('fr;q=something'), [{ locale: 'fr', qualityValue: undefined }]);
		assert.deepEqual(parseLocale('fr;q=1000'), [{ locale: 'fr', qualityValue: undefined }]);
	});
});
