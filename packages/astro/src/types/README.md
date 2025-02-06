# `types/`

In this folder rest the types that are used throughout Astro. Typically folders for corresponding features will have a corresponding `types.ts` file in their folder. For example, the `src/assets/types.ts` contain the types for `astro:assets`. However this folder can be useful for types that are used across multiple features, or generally don't fit in any other folder.

This folder additionally contain a `public` folder, which contains types that are exposed to users one way or another. Remember that these types are part of the public API, and as such follow the same semver contract as the rest of Astro.
