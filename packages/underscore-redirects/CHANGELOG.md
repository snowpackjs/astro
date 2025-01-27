# @astrojs/underscore-redirects

## 0.6.0

### Minor Changes

- [#12924](https://github.com/withastro/astro/pull/12924) [`3caa337`](https://github.com/withastro/astro/commit/3caa337f0ba917ad677fd8438b7045abc5d29e1c) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Updates how the output is determined in `createRedirectsFromAstroRoutes`. Since `v0.5.0`, the output would use the `buildOutput` property and `config.output` as a fallback. It no longer uses this fallback.

- [#12924](https://github.com/withastro/astro/pull/12924) [`3caa337`](https://github.com/withastro/astro/commit/3caa337f0ba917ad677fd8438b7045abc5d29e1c) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Updates the input requirements of `createRedirectsFromAstroRoutes`:

  - `routeToDynamicTargetMap` keys are `IntegrationResolvedRoute` instead of `IntegrationRouteData` (obtained from the `astro:routes:resolved` hook)
  - There's a new `assets` property, that can be obtained from the `astro:build:done` hook

  ```js
  function myIntegration() {
    let routes;
    let buildOutput;
    let config;

    return {
      name: 'my-integration',
      hooks: {
        'astro:routes:resolved': (params) => {
          routes = params.routes;
        },
        'astro:config:done': (params) => {
          buildOutput = params.buildOutput;
          config = params.config;
        },
        'astro:build:done': (params) => {
          const redirects = createRedirectsFromAstroRoutes({
            config,
            buildOutput,
            routeToDynamicTargetMap: new Map(routes.map((route) => [route, ''])),
            dir: params.dir,
            assets: params.assets,
          });
        },
      },
    };
  }
  ```

## 0.5.1

### Patch Changes

- [#12904](https://github.com/withastro/astro/pull/12904) [`7fdbd43`](https://github.com/withastro/astro/commit/7fdbd4384dea186b9bbc2c6b130e8aba2a2c1e89) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Fixes the type of `force`

## 0.5.0

### Minor Changes

- [#12768](https://github.com/withastro/astro/pull/12768) [`524c855`](https://github.com/withastro/astro/commit/524c855075bb75696500445fdc31cb2c69b09627) Thanks [@ematipico](https://github.com/ematipico)! - Adds a new `buildOutput` property to the API `createRedirectsFromAstroRoutes`

## 0.4.0

### Minor Changes

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

- [#11989](https://github.com/withastro/astro/pull/11989) [`3e70853`](https://github.com/withastro/astro/commit/3e70853b767b124bf867072b1c67474dd0b51c3f) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Updates the type from `RouteData` to `IntegrationRouteData`

## 0.4.0-beta.1

### Minor Changes

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

## 0.4.0-alpha.0

### Minor Changes

- [#11989](https://github.com/withastro/astro/pull/11989) [`3e70853`](https://github.com/withastro/astro/commit/3e70853b767b124bf867072b1c67474dd0b51c3f) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Updates the type from `RouteData` to `IntegrationRouteData`

## 0.3.4

### Patch Changes

- [#11271](https://github.com/withastro/astro/pull/11271) [`7f956f0`](https://github.com/withastro/astro/commit/7f956f07958e1a486ca0e28d4135c33ec7c347b0) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds support for forced redirects

  Redirects can be forced by setting `force` to `true`:

  ```ts
  redirects.add({
    // ...
    force: true,
  });
  ```

  It will append a `!` after the status.

## 0.3.3

### Patch Changes

- [#8979](https://github.com/withastro/astro/pull/8979) [`0ee7c9aac`](https://github.com/withastro/astro/commit/0ee7c9aac9d0dbe727edb91ce944d607947aa242) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Fixes a regression which used the wrong pattern for dynamic pages

## 0.3.2

### Patch Changes

- [#8953](https://github.com/withastro/astro/pull/8953) [`6bc2153d0`](https://github.com/withastro/astro/commit/6bc2153d0ffb5b534caabb84f0fbe1af5c3d7826) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Adds the base path as prefix for input paths

## 0.3.1

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

## 0.3.0

### Minor Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 0.3.0-rc.1

### Minor Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 0.3.0-beta.0

### Minor Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 0.2.0

### Minor Changes

- [#7615](https://github.com/withastro/astro/pull/7615) [`f21357b69`](https://github.com/withastro/astro/commit/f21357b69d94fe8d81f267efddb182d1a3cc678a) Thanks [@ematipico](https://github.com/ematipico)! - Refactor how the routes are passed.
