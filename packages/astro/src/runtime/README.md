# `runtime/`

Code that executes within isolated contexts:

- `client/`: executes within the browser. Astro’s client-side partial hydration code lives here, and only browser-compatible code can be used.
- `server/`: executes inside Vite SSR. Though also a Node context, this is isolated from code in `core/`.
- `compiler/`: same as `server/`, but only used by the Astro compiler `internalURL` option.

[See CONTRIBUTING.md](../../../../CONTRIBUTING.md) for a code overview.
