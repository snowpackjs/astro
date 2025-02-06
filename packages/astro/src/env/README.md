# env

The content of this directory is for `astro:env` features, except for `vite-plugin-import-meta-env.ts`.

# vite-plugin-import-meta-env

Improves Vite's [Env Variables](https://vite.dev/guide/env-and-mode.html#env-files) support to include **private** env variables during Server-Side Rendering (SSR) but never in client-side rendering (CSR).

Private env variables can be accessed through `import.meta.env.SECRET` like Vite. Where the env variable is declared changes how it is replaced when transforming it:

- If it's from a `.env` file, it gets replaced with the actual value. (static)
- If it's from `process.env`, it gets replaced as `process.env.SECRET`. (dynamic)
