import { describe, it } from 'node:test';
import { expectTypeOf } from 'expect-type';
import { defineConfig } from '../../dist/config/index.js';
import type { AstroUserConfig } from '../../dist/types/public/index.js';
import type { FontFamily, FontProvider } from '../../dist/assets/fonts/types.js';

function assertType<T>(data: T, cb: (data: NoInfer<T>) => void) {
	cb(data);
}

describe('defineConfig()', () => {
	it('Infers i18n generics correctly', () => {
		assertType(defineConfig({}), (config) => {
			expectTypeOf(config).toEqualTypeOf<AstroUserConfig<never, never, never, never>>();
			expectTypeOf(config.i18n!.defaultLocale).toEqualTypeOf<string>();
		});

		assertType(
			defineConfig({
				i18n: {
					locales: ['en'],
					defaultLocale: 'en',
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<AstroUserConfig<['en'], never, never, never>>();
				expectTypeOf(config.i18n!.defaultLocale).toEqualTypeOf<'en'>();
			},
		);

		assertType(
			defineConfig({
				i18n: {
					locales: ['en', 'fr'],
					defaultLocale: 'fr',
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<AstroUserConfig<['en', 'fr'], never, never, never>>();
				expectTypeOf(config.i18n!.defaultLocale).toEqualTypeOf<'en' | 'fr'>();
			},
		);

		assertType(
			defineConfig({
				i18n: {
					locales: ['en', { path: 'french', codes: ['fr', 'fr-FR'] }],
					defaultLocale: 'en',
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<
					AstroUserConfig<
						['en', { readonly path: 'french'; readonly codes: ['fr', 'fr-FR'] }],
						never,
						never,
						never
					>
				>();
				expectTypeOf(config.i18n!.defaultLocale).toEqualTypeOf<'en' | 'fr' | 'fr-FR'>();
			},
		);
	});

	it('Infers fonts generics correctly', () => {
		assertType(defineConfig({}), (config) => {
			expectTypeOf(config).toEqualTypeOf<AstroUserConfig<never, never, never, never>>();
			expectTypeOf(config.experimental!.fonts!.providers!).toEqualTypeOf<FontProvider<string>[]>();
			expectTypeOf(config.experimental!.fonts!.families).toEqualTypeOf<
				FontFamily<'google' | 'local'>[]
			>();
		});

		assertType(
			defineConfig({
				experimental: {
					fonts: {
						families: [],
					},
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<AstroUserConfig<never, never, never, []>>();
				expectTypeOf(config.experimental!.fonts!.providers!).toEqualTypeOf<
					FontProvider<string>[]
				>();
				expectTypeOf(config.experimental!.fonts!.families).toEqualTypeOf<[]>();
			},
		);

		assertType(
			defineConfig({
				experimental: {
					fonts: {
						families: [{ provider: 'google' }, { provider: 'local', src: 'test' }],
					},
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<
					AstroUserConfig<
						never,
						never,
						never,
						[
							{ readonly provider: 'google' },
							{
								readonly provider: 'local';
								readonly src: 'test';
							},
						]
					>
				>();
				expectTypeOf(config.experimental!.fonts!.providers!).toEqualTypeOf<
					FontProvider<string>[]
				>();
				expectTypeOf(config.experimental!.fonts!.families).toEqualTypeOf<
					[
						{ readonly provider: 'google' },
						{
							readonly provider: 'local';
							readonly src: 'test';
						},
					]
				>();
			},
		);

		assertType(
			defineConfig({
				experimental: {
					fonts: {
						providers: [],
						families: [],
					},
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<AstroUserConfig<never, never, [], []>>();
				expectTypeOf(config.experimental!.fonts!.providers!).toEqualTypeOf<[]>();
				expectTypeOf(config.experimental!.fonts!.families).toEqualTypeOf<[]>();
			},
		);

		assertType(
			defineConfig({
				experimental: {
					fonts: {
						providers: [{ name: 'adobe', entrypoint: '' }],
						families: [],
					},
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<
					AstroUserConfig<
						never,
						never,
						[
							{
								readonly name: 'adobe';
								readonly entrypoint: '';
							},
						],
						[]
					>
				>();
				expectTypeOf(config.experimental!.fonts!.providers!).toEqualTypeOf<
					[
						{
							readonly name: 'adobe';
							readonly entrypoint: '';
						},
					]
				>();
				expectTypeOf(config.experimental!.fonts!.families).toEqualTypeOf<[]>();
			},
		);

		assertType(
			defineConfig({
				experimental: {
					fonts: {
						providers: [{ name: 'adobe', entrypoint: '' }],
						families: [
							{ provider: 'google' },
							{ provider: 'local', src: 'test' },
							{ provider: 'adobe' },
						],
					},
				},
			}),
			(config) => {
				expectTypeOf(config).toEqualTypeOf<
					AstroUserConfig<
						never,
						never,
						[
							{
								readonly name: 'adobe';
								readonly entrypoint: '';
							},
						],
						[
							{ readonly provider: 'google' },
							{
								readonly provider: 'local';
								readonly src: 'test';
							},
							{ readonly provider: 'adobe' },
						]
					>
				>();
				expectTypeOf(config.experimental!.fonts!.providers!).toEqualTypeOf<
					[
						{
							readonly name: 'adobe';
							readonly entrypoint: '';
						},
					]
				>();
				expectTypeOf(config.experimental!.fonts!.families).toEqualTypeOf<
					[
						{ readonly provider: 'google' },
						{
							readonly provider: 'local';
							readonly src: 'test';
						},
						{ readonly provider: 'adobe' },
					]
				>();
			},
		);
	});
});
