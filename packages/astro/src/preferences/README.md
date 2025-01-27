# Preferences

The preferences module implements global and local user preferences for controlling certain Astro behavior. Whereas the `astro.config.mjs` file controls project-specific behavior for every user of a project, preferences are user-specific.

The design of Preferences is inspired by [Git](https://git-scm.com/book/en/v2/Customizing-Git-Git-Configuration) and [Visual Studio Code](https://code.visualstudio.com/docs/getstarted/settings). Both systems implement similar layering approaches with project-specific and global settings.

## `AstroPreferences`

The `AstroPreferences` interface exposes both a `get` and `set` function.

### Reading a preference

`preferences.get("dot.separated.value")` will read a preference value from multiple sources if needed. Local project preferences are read from `.astro/settings.json`, if it exists. Next, global user preferences are read from `<homedir>/<os-specific-preferences-dir>/astro/settings.json`. If neither of those are found, the default preferences defined in [`./defaults.ts`](./defaults.ts) will apply.

In order to read a preference from a specific location, you can pass the `location: "global" | "project"` option.

```js
await preferences.get('dot.separated.value', { location: 'global' });
```

### Writing a preference

`preferences.set("dot.separated.value", true)` will store a preference value. By default, preferences are stored locally in a project.

In order to set a global user preference, you can pass the `location: "global"` option.

```js
await preferences.set('dot.separated.value', 'value', { location: 'global' });
```

## Relation to Telemetry

This module evolved from the existing `@astrojs/telemetry` package, but has been generalized for user-facing `astro` preferences. At some point, we'll need to merge the logic in `@astrojs/telemetry` and the logic in this module so that all preferences are stored in the same location.
