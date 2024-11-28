---
'astro': minor
---

Exposes extra APIs for scripting and testing:

- `mergeConfig` is now exported from `astro/config`, allowing users to merge Astro config objects directly;
- `validateConfig` is now exported from `astro/config`, allowing users to resolve a config object into a valid `AstroConfig`;
- `build` API now includes the `teardownCompiler` option, allowing for more performant building during scripts and tests outside of Astro core.
