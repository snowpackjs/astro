# Plugin directory (WIP)

This file serves as developer documentation to explain how the internal plugins work

## `plugin-middleware`

This plugin is responsible to retrieve the `src/middleware.{ts.js}` file and emit an entry point during the SSR build.

The final file is emitted only if the user has the middleware file. The final name of the file is `middleware.mjs`.

This is **not** a virtual module. The plugin will try to resolve the physical file.

## `plugin-renderers`

This plugin is responsible to collect all the renderers inside an Astro application and emit them in a single file.

The emitted file is called `renderers.mjs`.

The emitted file has content similar to:

```js
const renderers = [
  Object.assign(
    { name: 'astro:framework', serverEntrypoint: '@astrojs/framework/server.js' },
    { ssr: server_default },
  ),
];

export { renderers };
```

## `plugin-pages`

This plugin is responsible to collect all pages inside an Astro application, and emit a single entry point file for each page.

This plugin **will emit code** only when building a static site.

In order to achieve that, the plugin emits these pages as **virtual modules**. Doing so allows us to bypass:

- rollup resolution of the files
- possible plugins that get triggered when the name of the module has an extension e.g. `.astro`

The plugin does the following operations:

- loop through all the pages and collects their paths;
- with each path, we create a new [string](#plugin-pages-mapping-resolution) that will serve and virtual module for that particular page
- when resolving the page, we check if the `id` of the module starts with `@astro-page`
- once the module is resolved, we emit [the code of the module](#plugin-pages-code-generation)

### `plugin pages` mapping resolution

The mapping is as follows:

```
src/pages/index.astro => @astro-page:src/pages/index@_@astro
```

1. We add a fixed prefix, which is used as virtual module naming convention;
2. We replace the dot that belongs extension with an arbitrary string.

This kind of patterns will then allow us to retrieve the path physical path of the
file back from that string. This is important for the [code generation](#plugin-pages-code-generation)

### `plugin pages` code generation

When generating the code of the page, we will import and export the following modules:

- the `renderers.mjs`
- the `middleware.mjs`
- the page, via dynamic import

The emitted code of each entry point will look like this:

```js
export { renderers } from '../renderers.mjs';
import { _ as _middleware } from '../middleware.mjs';
import '../chunks/astro.540fbe4e.mjs';

const page = () => import('../chunks/pages/index.astro.8aad0438.mjs');
const middleware = _middleware;

export { middleware, page };
```

If we have a `pages/` folder that looks like this:

```
├── blog
│   ├── first.astro
│   └── post.astro
├── first.astro
├── index.astro
├── issue.md
└── second.astro
```

The emitted entry points will be stored inside a `pages/` folder, and they
will look like this:

```
├── _astro
│   ├── first.132e69e0.css
│   ├── first.49cbf029.css
│   ├── post.a3e86c58.css
│   └── second.d178d0b2.css
├── chunks
│   ├── astro.540fbe4e.mjs
│   └── pages
│       ├── first.astro.493fa853.mjs
│       ├── index.astro.8aad0438.mjs
│       ├── issue.md.535b7d3b.mjs
│       ├── post.astro.26e892d9.mjs
│       └── second.astro.76540694.mjs
├── middleware.mjs
├── pages
│   ├── blog
│   │   ├── first.astro.mjs
│   │   └── post.astro.mjs
│   ├── first.astro.mjs
│   ├── index.astro.mjs
│   ├── issue.md.mjs
│   └── second.astro.mjs
└── renderers.mjs
```

Of course, all these files will be deleted by Astro at the end build.

## `plugin-ssr`

This plugin is responsible to create the JS files that will be executed in SSR.

### Classic mode

The plugin will emit a single entry point called `entry.mjs`.

This plugin **will emit code** only when building an **SSR** site.

The plugin will collect all the [virtual pages](#plugin-pages) and create
a JavaScript `Map`. These map will look like this:

```js
const _page$0 = () => import('../chunks/<INDEX.ASTRO_CHUNK>.mjs');
const _page$1 = () => import('../chunks/<ABOUT.ASTRO_CHUNK>.mjs');

const pageMap = new Map([
  ['src/pages/index.astro', _page$0],
  ['src/pages/about.astro', _page$1],
]);
```

It will also import the [`renderers`](#plugin-renderers) virtual module
and the [`manifest`](#plugin-manifest) virtual module.

### Split mode

The plugin will emit various entry points. Each route will be an entry point.

Each entry point will contain the necessary code to **render one single route**.

Each entry point will also import the [`renderers`](#plugin-renderers) virtual module
and the [`manifest`](#plugin-manifest) virtual module.

## `plugin-manifest`

This plugin is responsible to create a file called `manifest.mjs`. In SSG, the file is saved
in `config.outDir`, in SSR the file is saved in `config.build.server`.

This file is important to do two things:

- generate the pages during the SSG;
- render the pages in SSR;

The file contains all the information needed to Astro to accomplish the operations mentioned above.
