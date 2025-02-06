---
'@astrojs/telemetry': minor
'astro': minor
---

Adds a configuration option to disable CLI telemetry for the project

Astro collects optional anonymous telemetry to help us understand how people use the CLI. This change adds a new way to disable telemetry on a per-project basis. Currently you can disable telemetry globally per machine by running `astro telemetry disable` or by setting the environment variable `ASTRO_TELEMETRY_DISABLE`. This change adds a new configuration option to disable telemetry for a specific project, which applies to all users of the project.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  disableTelemetry: true
});

```
