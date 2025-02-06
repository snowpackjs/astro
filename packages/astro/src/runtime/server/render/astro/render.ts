import { AstroError, AstroErrorData } from '../../../../core/errors/index.js';
import type { RouteData, SSRResult } from '../../../../types/public/internal.js';
import { type RenderDestination, chunkToByteArray, chunkToString, encoder } from '../common.js';
import { promiseWithResolvers } from '../util.js';
import type { AstroComponentFactory } from './factory.js';
import { isHeadAndContent } from './head-and-content.js';
import { isRenderTemplateResult } from './render-template.js';

const DOCTYPE_EXP = /<!doctype html/i;

// Calls a component and renders it into a string of HTML
export async function renderToString(
	result: SSRResult,
	componentFactory: AstroComponentFactory,
	props: any,
	children: any,
	isPage = false,
	route?: RouteData,
): Promise<string | Response> {
	const templateResult = await callComponentAsTemplateResultOrResponse(
		result,
		componentFactory,
		props,
		children,
		route,
	);

	// If the Astro component returns a Response on init, return that response
	if (templateResult instanceof Response) return templateResult;

	let str = '';
	let renderedFirstPageChunk = false;

	if (isPage) {
		await bufferHeadContent(result);
	}

	const destination: RenderDestination = {
		write(chunk) {
			// Automatic doctype insertion for pages
			if (isPage && !renderedFirstPageChunk) {
				renderedFirstPageChunk = true;
				if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
					const doctype = result.compressHTML ? '<!DOCTYPE html>' : '<!DOCTYPE html>\n';
					str += doctype;
				}
			}

			// `renderToString` doesn't work with emitting responses, so ignore here
			if (chunk instanceof Response) return;

			str += chunkToString(result, chunk);
		},
	};

	await templateResult.render(destination);

	return str;
}

// Calls a component and renders it into a readable stream
export async function renderToReadableStream(
	result: SSRResult,
	componentFactory: AstroComponentFactory,
	props: any,
	children: any,
	isPage = false,
	route?: RouteData,
): Promise<ReadableStream | Response> {
	const templateResult = await callComponentAsTemplateResultOrResponse(
		result,
		componentFactory,
		props,
		children,
		route,
	);

	// If the Astro component returns a Response on init, return that response
	if (templateResult instanceof Response) return templateResult;

	let renderedFirstPageChunk = false;

	if (isPage) {
		await bufferHeadContent(result);
	}

	return new ReadableStream({
		start(controller) {
			const destination: RenderDestination = {
				write(chunk) {
					// Automatic doctype insertion for pages
					if (isPage && !renderedFirstPageChunk) {
						renderedFirstPageChunk = true;
						if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
							const doctype = result.compressHTML ? '<!DOCTYPE html>' : '<!DOCTYPE html>\n';
							controller.enqueue(encoder.encode(doctype));
						}
					}

					// `chunk` might be a Response that contains a redirect,
					// that was rendered eagerly and therefore bypassed the early check
					// whether headers can still be modified. In that case, throw an error
					if (chunk instanceof Response) {
						throw new AstroError({
							...AstroErrorData.ResponseSentError,
						});
					}

					const bytes = chunkToByteArray(result, chunk);
					controller.enqueue(bytes);
				},
			};

			(async () => {
				try {
					await templateResult.render(destination);
					controller.close();
				} catch (e) {
					// We don't have a lot of information downstream, and upstream we can't catch the error properly
					// So let's add the location here
					if (AstroError.is(e) && !e.loc) {
						e.setLocation({
							file: route?.component,
						});
					}

					// Queue error on next microtask to flush the remaining chunks written synchronously
					setTimeout(() => controller.error(e), 0);
				}
			})();
		},
		cancel() {
			// If the client disconnects,
			// we signal to ignore the results of existing renders and avoid kicking off more of them.
			result.cancelled = true;
		},
	});
}

async function callComponentAsTemplateResultOrResponse(
	result: SSRResult,
	componentFactory: AstroComponentFactory,
	props: any,
	children: any,
	route?: RouteData,
) {
	const factoryResult = await componentFactory(result, props, children);

	if (factoryResult instanceof Response) {
		return factoryResult;
	}
	// we check if the component we attempt to render is a head+content
	else if (isHeadAndContent(factoryResult)) {
		// we make sure that content is valid template result
		if (!isRenderTemplateResult(factoryResult.content)) {
			throw new AstroError({
				...AstroErrorData.OnlyResponseCanBeReturned,
				message: AstroErrorData.OnlyResponseCanBeReturned.message(
					route?.route,
					typeof factoryResult,
				),
				location: {
					file: route?.component,
				},
			});
		}

		// return the content
		return factoryResult.content;
	} else if (!isRenderTemplateResult(factoryResult)) {
		throw new AstroError({
			...AstroErrorData.OnlyResponseCanBeReturned,
			message: AstroErrorData.OnlyResponseCanBeReturned.message(route?.route, typeof factoryResult),
			location: {
				file: route?.component,
			},
		});
	}

	return factoryResult;
}

// Recursively calls component instances that might have head content
// to be propagated up.
async function bufferHeadContent(result: SSRResult) {
	const iterator = result._metadata.propagators.values();
	while (true) {
		const { value, done } = iterator.next();
		if (done) {
			break;
		}
		// Call component instances that might have head content to be propagated up.
		const returnValue = await value.init(result);
		if (isHeadAndContent(returnValue)) {
			result._metadata.extraHead.push(returnValue.head);
		}
	}
}

export async function renderToAsyncIterable(
	result: SSRResult,
	componentFactory: AstroComponentFactory,
	props: any,
	children: any,
	isPage = false,
	route?: RouteData,
): Promise<AsyncIterable<Uint8Array> | Response> {
	const templateResult = await callComponentAsTemplateResultOrResponse(
		result,
		componentFactory,
		props,
		children,
		route,
	);
	if (templateResult instanceof Response) return templateResult;
	let renderedFirstPageChunk = false;
	if (isPage) {
		await bufferHeadContent(result);
	}

	// This implements the iterator protocol:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols
	// The `iterator` is passed to the Response as a stream-like thing.
	// The `buffer` array acts like a buffer. During render the `destination` pushes
	// chunks of Uint8Arrays into the buffer. The response calls `next()` and we combine
	// all of the chunks into one Uint8Array and then empty it.

	let error: Error | null = null;
	// The `next` is an object `{ promise, resolve, reject }` that we use to wait
	// for chunks to be pushed into the buffer.
	let next: ReturnType<typeof promiseWithResolvers<void>> | null = null;
	const buffer: Uint8Array[] = []; // []Uint8Array
	let renderingComplete = false;

	const iterator: AsyncIterator<Uint8Array> = {
		async next() {
			if (result.cancelled) return { done: true, value: undefined };

			if (next !== null) {
				await next.promise;
			}
			// Buffer is empty so there's nothing to receive, wait for the next resolve.
			else if (!renderingComplete && !buffer.length) {
				next = promiseWithResolvers();
				await next.promise;
			}

			// Only create a new promise if rendering is still ongoing. Otherwise
			// there will be a dangling promises that breaks tests (probably not an actual app)
			if (!renderingComplete) {
				next = promiseWithResolvers();
			}

			// If an error occurs during rendering, throw the error as we cannot proceed.
			if (error) {
				throw error;
			}

			// Get the total length of all arrays.
			let length = 0;
			for (let i = 0, len = buffer.length; i < len; i++) {
				length += buffer[i].length;
			}

			// Create a new array with total length and merge all source arrays.
			let mergedArray = new Uint8Array(length);
			let offset = 0;
			for (let i = 0, len = buffer.length; i < len; i++) {
				const item = buffer[i];
				mergedArray.set(item, offset);
				offset += item.length;
			}

			// Empty the array. We do this so that we can reuse the same array.
			buffer.length = 0;

			const returnValue = {
				// The iterator is done when rendering has finished
				// and there are no more chunks to return.
				done: length === 0 && renderingComplete,
				value: mergedArray,
			};

			return returnValue;
		},
		async return() {
			// If the client disconnects,
			// we signal to the rest of the internals to ignore the results of existing renders and avoid kicking off more of them.
			result.cancelled = true;
			return { done: true, value: undefined };
		},
	};

	const destination: RenderDestination = {
		write(chunk) {
			if (isPage && !renderedFirstPageChunk) {
				renderedFirstPageChunk = true;
				if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
					const doctype = result.compressHTML ? '<!DOCTYPE html>' : '<!DOCTYPE html>\n';
					buffer.push(encoder.encode(doctype));
				}
			}
			if (chunk instanceof Response) {
				throw new AstroError(AstroErrorData.ResponseSentError);
			}
			const bytes = chunkToByteArray(result, chunk);
			// It might be possible that we rendered a chunk with no content, in which
			// case we don't want to resolve the promise.
			if (bytes.length > 0) {
				// Push the chunks into the buffer and resolve the promise so that next()
				// will run.
				buffer.push(bytes);
				next?.resolve();
			} else if (buffer.length > 0) {
				next?.resolve();
			}
		},
	};

	const renderPromise = templateResult.render(destination);
	renderPromise
		.then(() => {
			// Once rendering is complete, calling resolve() allows the iterator to finish running.
			renderingComplete = true;
			next?.resolve();
		})
		.catch((err) => {
			// If an error occurs, save it in the scope so that we throw it when next() is called.
			error = err;
			renderingComplete = true;
			next?.resolve();
		});

	// This is the Iterator protocol, an object with a `Symbol.asyncIterator`
	// function that returns an object like `{ next(): Promise<{ done: boolean; value: any }> }`
	return {
		[Symbol.asyncIterator]() {
			return iterator;
		},
	};
}
