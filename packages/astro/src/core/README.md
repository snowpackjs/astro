# `core/`

Code that executes directly on Node (not processed by vite). Contains the main Astro logic for the `build`, `dev`, `preview`, and `sync` commands, and also manages the lifecycle of the Vite server.

The `core/index.ts` module exports the CLI commands as functions and is the main entrypoint of the `astro` package.

```ts
import { dev, build, preview, sync } from 'astro';
```

[See CONTRIBUTING.md](../../../../CONTRIBUTING.md) for a code overview.

```
                                                                                                            Pages
                                                                                                   used by /
                                                                                                          /
                               creates                                                                   /
                          App --------- AppPipeline                                           AstroGlobal
                                                   \ implements                              /
                                                    \                               creates /
                          creates               impl.\           provided to               /
vite-plugin-astro-server --------- DevPipeline ------ Pipeline ------------- RenderContext                Middleware
                                                     /                                     \      used by /
                                                    /                               creates \            /
                             creates               / implements                              \          /
               AstroBuilder --------- BuildPipeline                                           APIContext
                                                                                                        \
                                                                                                         \
                                                                                                  used by \
                                                                                                           Endpoints
```

## `App`

## `vite-plugin-astro-server` (see `../vite-plugin-astro-server/`)

## `AstroBuilder`

## `Pipeline`

The pipeline is an interface representing data that stays unchanged throughout the duration of the server or build. For example: the user configuration, the list of pages and endpoints in the project, and environment-specific way of gathering scripts and styles.

There are 3 implementations of the pipeline:

- `DevPipeline`: in-use during the `astro dev` CLI command. Created and used by `vite-plugin-astro-server`, and then forwarded to other internals.
- `BuildPipeline`: in-use during the `astro build` command in `"static"` mode, and for prerendering in `"server"` and `"hybrid"` output modes. See `core/build/`.
- `AppPipeline`: in-use during production server(less) deployments. Created and used by `App` (see `core/app/`), and then forwarded to other internals.

All 3 expose a common, environment-agnostic interface which is used by the rest of the internals, most notably by `RenderContext`.

## `RenderContext`

Each request is rendered using a `RenderContext`. It manages data unique to each request. For example: the parsed `URL`, internationalization data, the `locals` object, and the route that matched the request. It is responsible for executing middleware, calling endpoints, and rendering pages by gathering necessary data from a `Pipeline`.
