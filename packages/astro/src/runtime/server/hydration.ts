import { AstroError, AstroErrorData } from '../../core/errors/index.js';
import type {
	AstroComponentMetadata,
	SSRElement,
	SSRLoadedRenderer,
	SSRResult,
} from '../../types/public/internal.js';
import { escapeHTML } from './escape.js';
import { serializeProps } from './serialize.js';

export interface HydrationMetadata {
	directive: string;
	value: string;
	componentUrl: string;
	componentExport: { value: string };
}

type Props = Record<string | number | symbol, any>;

interface ExtractedProps {
	isPage: boolean;
	hydration: HydrationMetadata | null;
	props: Props;
	propsWithoutTransitionAttributes: Props;
}

const transitionDirectivesToCopyOnIsland = Object.freeze([
	'data-astro-transition-scope',
	'data-astro-transition-persist',
	'data-astro-transition-persist-props',
]);

// Used to extract the directives, aka `client:load` information about a component.
// Finds these special props and removes them from what gets passed into the component.
export function extractDirectives(
	inputProps: Props,
	clientDirectives: SSRResult['clientDirectives'],
): ExtractedProps {
	let extracted: ExtractedProps = {
		isPage: false,
		hydration: null,
		props: {},
		propsWithoutTransitionAttributes: {},
	};
	for (const [key, value] of Object.entries(inputProps)) {
		if (key.startsWith('server:')) {
			if (key === 'server:root') {
				extracted.isPage = true;
			}
		}
		if (key.startsWith('client:')) {
			if (!extracted.hydration) {
				extracted.hydration = {
					directive: '',
					value: '',
					componentUrl: '',
					componentExport: { value: '' },
				};
			}
			switch (key) {
				case 'client:component-path': {
					extracted.hydration.componentUrl = value;
					break;
				}
				case 'client:component-export': {
					extracted.hydration.componentExport.value = value;
					break;
				}
				// This is a special prop added to prove that the client hydration method
				// was added statically.
				case 'client:component-hydration': {
					break;
				}
				case 'client:display-name': {
					break;
				}
				default: {
					extracted.hydration.directive = key.split(':')[1];
					extracted.hydration.value = value;

					// throw an error if an invalid hydration directive was provided
					if (!clientDirectives.has(extracted.hydration.directive)) {
						const hydrationMethods = Array.from(clientDirectives.keys())
							.map((d) => `client:${d}`)
							.join(', ');
						throw new Error(
							`Error: invalid hydration directive "${key}". Supported hydration methods: ${hydrationMethods}`,
						);
					}

					// throw an error if the query wasn't provided for client:media
					if (
						extracted.hydration.directive === 'media' &&
						typeof extracted.hydration.value !== 'string'
					) {
						throw new AstroError(AstroErrorData.MissingMediaQueryDirective);
					}

					break;
				}
			}
		} else {
			extracted.props[key] = value;
			if (!transitionDirectivesToCopyOnIsland.includes(key)) {
				extracted.propsWithoutTransitionAttributes[key] = value;
			}
		}
	}
	for (const sym of Object.getOwnPropertySymbols(inputProps)) {
		extracted.props[sym] = inputProps[sym];
		extracted.propsWithoutTransitionAttributes[sym] = inputProps[sym];
	}

	return extracted;
}

interface HydrateScriptOptions {
	renderer: SSRLoadedRenderer;
	result: SSRResult;
	astroId: string;
	props: Record<string | number, any>;
	attrs: Record<string, string> | undefined;
}

/** For hydrated components, generate a <script type="module"> to load the component */
export async function generateHydrateScript(
	scriptOptions: HydrateScriptOptions,
	metadata: Required<AstroComponentMetadata>,
): Promise<SSRElement> {
	const { renderer, result, astroId, props, attrs } = scriptOptions;
	const { hydrate, componentUrl, componentExport } = metadata;

	if (!componentExport.value) {
		throw new AstroError({
			...AstroErrorData.NoMatchingImport,
			message: AstroErrorData.NoMatchingImport.message(metadata.displayName),
		});
	}

	const island: SSRElement = {
		children: '',
		props: {
			// This is for HMR, probably can avoid it in prod
			uid: astroId,
		},
	};

	// Attach renderer-provided attributes
	if (attrs) {
		for (const [key, value] of Object.entries(attrs)) {
			island.props[key] = escapeHTML(value);
		}
	}

	// Add component url
	island.props['component-url'] = await result.resolve(decodeURI(componentUrl));

	// Add renderer url
	if (renderer.clientEntrypoint) {
		island.props['component-export'] = componentExport.value;
		island.props['renderer-url'] = await result.resolve(
			decodeURI(renderer.clientEntrypoint.toString()),
		);
		island.props['props'] = escapeHTML(serializeProps(props, metadata));
	}

	island.props['ssr'] = '';
	island.props['client'] = hydrate;
	let beforeHydrationUrl = await result.resolve('astro:scripts/before-hydration.js');
	if (beforeHydrationUrl.length) {
		island.props['before-hydration-url'] = beforeHydrationUrl;
	}
	island.props['opts'] = escapeHTML(
		JSON.stringify({
			name: metadata.displayName,
			value: metadata.hydrateArgs || '',
		}),
	);

	transitionDirectivesToCopyOnIsland.forEach((name) => {
		if (typeof props[name] !== 'undefined') {
			island.props[name] = props[name];
		}
	});

	return island;
}
