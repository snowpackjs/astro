# `core/render`

This directory contains most of Astro's high-level rendering APIs, including `renderPage`, `createRenderContext`, etc.

- For rendering an Astro file, see [src/runtime/server/](../../runtime/server/).
- For rendering an endpoint, see [src/core/endpoint/](../endpoint/).

## Concepts

The codebase has a few abstractions for rendering:

### `RenderContext`

Each render (page or endpoint) requires a `RenderContext` that contains:

- The `Request` object
- The matched `route`
- The matched `pathname` (without the `base`)
- The route `params` and `props`
- Additional `styles`, `links`, `scripts`
- And more!

The `RenderContext` is agnostic to what's being rendered.

**Permitted state:** `RenderContext` should only contain per-request information.

### `Environment`

Every app (dev and prod) has one `Environment`. It contains a subset of the Astro `settings`, `config`, and `routes` information needed for Astro's runtime to work.

In dev, all of `settings`, `config`, and `routes` are available, so the `Environment` (aka `DevelopmentEnvironment`) is derived directly from them. In prod, the `Environment` is derived from the `SSRManifest`, an intermediate layer that helps keep the build output lean.

**Permitted state:** `Environment` should only contain the global state shared across all requests.

### `SSRManifest`

An `SSRManifest` is created during a build to save information needed to create an `Environment` during runtime start-up. The values should be serializable (`buildManifest`) and deserializable (`deserializeManifest`).

The serialized string is inlined in the server output and can usually be read from the compiled module's `manifest` export.

### `SSRResult`

The `SSRResult` is used by the public rendering APIs at [`src/runtime/server/`](../../runtime/server/). At the top level, it is created by `renderPage` and passed down to the public rendering APIs. It is also often used in non-Astro pages, like `.mdx` and `.md`.

The `SSRResult` object contains a subset of `RenderContext`, the state used by the compiled output (`cookies`, `createAstro`, `resolve`, etc), and the state used by the rendering APIs (`_metadata`).

### `SSROptions`

The `SSROptions` is a small wrapper used only in dev to create a `RenderContext`. It is abstracted to share the same shape for `renderPage` and `renderEndpoint` ([src/core/endpoint/](../endpoint/)).

## Flow

### Development

NOTE: The development flow has a different API under [src/core/render/dev/](./dev/) that wraps the core API in this directory.

1. Create the `Environment` with `settings`, `config`, and `routes`.
2. Create `SSROptions` containing the `Request` and `Environment`.
3. Call `renderPage` with `SSROptions`.
4. Internally, `renderPage` creates a `RenderContext` and calls the core-`renderPage` API.
5. The core-`renderPage` creates the `SSRResult`.
6. Call the core-`render` API to render the page!

### Production

1. Deserialize the `SSRManifest`.
2. Create the `Environment` with the `SSRManifest`.
3. Create `RenderContext` from `Request` and `SSRManifest`.
4. Call the core-`renderPage` with `RenderContext` and `Environment`.
5. Call the core-`render` API to render the page!
