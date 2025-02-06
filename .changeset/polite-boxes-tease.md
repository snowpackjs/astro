---
'astro': patch
---

Remove `baseUrl` requirement for tsconfig path aliases. If a `baseUrl` is not set, `paths` entries in your tsconfig file will resolve relative to the tsconfig file. This aligns with [TypeScript’s module resolution strategy](https://www.typescriptlang.org/docs/handbook/modules/reference.html#relationship-to-baseurl).
