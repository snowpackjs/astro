# Astro Telemetry

This package is used to collect anonymous telemetry data within the Astro CLI.

It can be disabled in Astro using either method documented below:

```shell
# Option 1: Run this to disable telemetry globally across your entire machine.
astro telemetry disable
```

```shell
# Option 2: The ASTRO_TELEMETRY_DISABLED environment variable disables telemetry when set.
ASTRO_TELEMETRY_DISABLED=1 astro dev
```

Visit https://astro.build/telemetry/ for more information about our approach to anonymous telemetry in Astro.
