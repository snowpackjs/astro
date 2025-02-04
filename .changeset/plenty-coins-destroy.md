---
'@astrojs/partytown': patch
---

Adds support for overriding `copyLibFiles.dest` in the `astro:build:done` hook using the `lib` option in `astro.config.*`, if provided. If not specified, it falls back to the default `~partytown`. Also removes the leading "/" from the `lib` value to match the behavior of `fileURLToPath`.

Example:

```typescript
// Options in `astro.config.*`
partytown.config.lib = '/assets/lib/~partytown/';

// `astro:build:done` in `@astrojs/partytown` integration
copyLibFiles.dest =
  partytown.config.lib ?
    `${PROJECT_ROOT}/assets/lib/~partytown/` // Leading "/" removed to match `fileURLToPath` behavior
  : '~partytown'; // Default fallback
``` 