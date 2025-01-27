# @astrojs/solid-js

## 5.0.4

### Patch Changes

- [#13011](https://github.com/withastro/astro/pull/13011) [`cf30880`](https://github.com/withastro/astro/commit/cf3088060d45227dcb48e041c4ed5e0081d71398) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite

## 5.0.3

### Patch Changes

- [#12887](https://github.com/withastro/astro/pull/12887) [`ea603ae`](https://github.com/withastro/astro/commit/ea603aec80531205d38fed11c525b3faa0271903) Thanks [@louisescher](https://github.com/louisescher)! - Adds a warning message when multiple JSX-based UI frameworks are being used without either the `include` or `exclude` property being set on the integration.

## 5.0.2

### Patch Changes

- [#12923](https://github.com/withastro/astro/pull/12923) [`c7642fb`](https://github.com/withastro/astro/commit/c7642fb80b2a2b4d1ec18369b37700ff28b4c041) Thanks [@bluwy](https://github.com/bluwy)! - Adds the client entrypoint to `optimizeDeps.include`

## 5.0.1

### Patch Changes

- [#12799](https://github.com/withastro/astro/pull/12799) [`739dbfb`](https://github.com/withastro/astro/commit/739dbfba4214107cf8fc40c702834dad33eed3b0) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite to pin esbuild

## 5.0.0

### Major Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates Vite dependency to v6 to match Astro v5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

### Patch Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates vite-plugin-solid to handle Vite 6

## 5.0.0-beta.1

### Major Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates Vite dependency to v6 to match Astro v5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

### Patch Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates vite-plugin-solid to handle Vite 6

## 4.4.4

### Patch Changes

- [#12481](https://github.com/withastro/astro/pull/12481) [`8a46e80`](https://github.com/withastro/astro/commit/8a46e8074d6afb4a23badbd59ed239d526294e8c) Thanks [@marbrex](https://github.com/marbrex)! - Resolve `vite` peer dependency problem for strict package managers like **Yarn in PnP mode**.

## 4.4.3

### Patch Changes

- [#12364](https://github.com/withastro/astro/pull/12364) [`9fc2ab8`](https://github.com/withastro/astro/commit/9fc2ab8cc848739a21bfa3f754e9bec4926dc034) Thanks [@jdtjenkins](https://github.com/jdtjenkins)! - Handles checking Svelte 5 component functions to avoid processing them as Solid components

## 4.4.2

### Patch Changes

- [#11998](https://github.com/withastro/astro/pull/11998) [`082f450`](https://github.com/withastro/astro/commit/082f45094471d52e55c55d3291f541306d9388b1) Thanks [@johannesspohr](https://github.com/johannesspohr)! - Fix view transition state persistence

## 4.4.1

### Patch Changes

- [#11624](https://github.com/withastro/astro/pull/11624) [`7adb350`](https://github.com/withastro/astro/commit/7adb350a37f3975c8c9db89a32bf63b9fd0b78c2) Thanks [@bluwy](https://github.com/bluwy)! - Prevents throwing errors when checking if a component is a Solid component in runtime

## 4.4.0

### Minor Changes

- [#11234](https://github.com/withastro/astro/pull/11234) [`4385bf7`](https://github.com/withastro/astro/commit/4385bf7a4dc9c65bff53a30c660f7a909fcabfc9) Thanks [@ematipico](https://github.com/ematipico)! - Adds a new function called `addServerRenderer` to the Container API. Use this function to manually store renderers inside the instance of your container.

  This new function should be preferred when using the Container API in environments like on-demand pages:

  ```ts
  import type { APIRoute } from 'astro';
  import { experimental_AstroContainer } from 'astro/container';
  import reactRenderer from '@astrojs/react/server.js';
  import vueRenderer from '@astrojs/vue/server.js';
  import ReactComponent from '../components/button.jsx';
  import VueComponent from '../components/button.vue';

  // MDX runtime is contained inside the Astro core
  import mdxRenderer from 'astro/jsx/server.js';

  // In case you need to import a custom renderer
  import customRenderer from '../renderers/customRenderer.js';

  export const GET: APIRoute = async (ctx) => {
    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ renderer: reactRenderer });
    container.addServerRenderer({ renderer: vueRenderer });
    container.addServerRenderer({ renderer: customRenderer });
    // You can pass a custom name too
    container.addServerRenderer({
      name: 'customRenderer',
      renderer: customRenderer,
    });
    const vueComponent = await container.renderToString(VueComponent);
    return await container.renderToResponse(Component);
  };
  ```

## 4.3.0

### Minor Changes

- [#11144](https://github.com/withastro/astro/pull/11144) [`803dd80`](https://github.com/withastro/astro/commit/803dd8061df02138b4928442bcb76e77dcf6f5e7) Thanks [@ematipico](https://github.com/ematipico)! - The integration now exposes a function called `getContainerRenderer`, that can be used inside the Container APIs to load the relative renderer.

  ```js
  import { experimental_AstroContainer as AstroContainer } from 'astro/container';
  import ReactWrapper from '../src/components/ReactWrapper.astro';
  import { loadRenderers } from 'astro:container';
  import { getContainerRenderer } from '@astrojs/react';

  test('ReactWrapper with react renderer', async () => {
    const renderers = await loadRenderers([getContainerRenderer()]);
    const container = await AstroContainer.create({
      renderers,
    });
    const result = await container.renderToString(ReactWrapper);

    expect(result).toContain('Counter');
    expect(result).toContain('Count: <!-- -->5');
  });
  ```

## 4.2.0

### Minor Changes

- [#10937](https://github.com/withastro/astro/pull/10937) [`7179930`](https://github.com/withastro/astro/commit/7179930ac85828b1a32c0c07c7d4759ce60044f5) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds a `devtools` option

  You can enable the [official Solid Devtools](https://github.com/thetarnav/solid-devtools) while working in development mode by setting `devtools: true` in your `solid()` integration config and adding `solid-devtools` to your project dependencies:

  ```bash
  npm install solid-devtools
  # yarn add solid-devtools
  # pnpm add solid-devtools
  ```

  ```js
  import { defineConfig } from 'astro/config';
  import solid from '@astrojs/solid-js';

  export default defineConfig({
    integrations: [solid({ devtools: true })],
  });
  ```

## 4.1.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

## 4.0.1

### Patch Changes

- [#9355](https://github.com/withastro/astro/pull/9355) [`2e4d110a876efc4ddcdeda403259317d1cbb742d`](https://github.com/withastro/astro/commit/2e4d110a876efc4ddcdeda403259317d1cbb742d) Thanks [@marvin-j97](https://github.com/marvin-j97)! - Upgrades `vite-plugin-solid` to `^2.8.0`

## 4.0.0

### Major Changes

- [#6791](https://github.com/withastro/astro/pull/6791) [`37021044dd4382a9b214f89b7c221bf1c93f3e7d`](https://github.com/withastro/astro/commit/37021044dd4382a9b214f89b7c221bf1c93f3e7d) Thanks [@patdx](https://github.com/patdx)! - Render SolidJS components using [`renderToStringAsync`](https://www.solidjs.com/docs/latest#rendertostringasync).

  This changes the renderer of SolidJS components from `renderToString` to `renderToStringAsync`. It also injects the actual SolidJS hydration script generated by [`generateHydrationScript`](https://www.solidjs.com/guides/server#hydration-script), so that [`Suspense`](https://www.solidjs.com/docs/latest#suspense), [`ErrorBoundary`](https://www.solidjs.com/docs/latest#errorboundary) and similar components can be hydrated correctly.

  The server render phase will now wait for Suspense boundaries to resolve instead of always rendering the Suspense fallback.

  If you use the APIs [`createResource`](https://www.solidjs.com/docs/latest#createresource) or [`lazy`](https://www.solidjs.com/docs/latest#lazy), their functionalities will now be executed on the server side, not just the client side.

  This increases the flexibility of the SolidJS integration. Server-side components can now safely fetch remote data, call async Astro server functions like `getImage()` or load other components dynamically. Even server-only components that do not hydrate in the browser will benefit.

  It is very unlikely that a server-only component would have used the Suspense feature until now, so this should not be a breaking change for server-only components.

  This could be a breaking change for components that meet the following conditions:

  - The component uses Suspense APIs like `Suspense`, `lazy` or `createResource`, and
  - The component is mounted using a _hydrating_ directive:
    - `client:load`
    - `client:idle`
    - `client:visible`
    - `client:media`

  These components will now first try to resolve the Suspense boundaries on the server side instead of the client side.

  If you do not want Suspense boundaries to be resolved on the server (for example, if you are using createResource to do an HTTP fetch that relies on a browser-side cookie), you may consider:

  - changing the template directive to `client:only` to skip server side rendering completely
  - use APIs like [isServer](https://www.solidjs.com/docs/latest/api#isserver) or `onMount()` to detect server mode and render a server fallback without using Suspense.

## 3.0.3

### Patch Changes

- [#9482](https://github.com/withastro/astro/pull/9482) [`72b26daf694b213918f02d0fcbf90ab5b7ebc31f`](https://github.com/withastro/astro/commit/72b26daf694b213918f02d0fcbf90ab5b7ebc31f) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improves compatibility with the [Qwik adapter](https://github.com/QwikDev/astro)

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 3.0.2

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

## 3.0.1

### Patch Changes

- [#8365](https://github.com/withastro/astro/pull/8365) [`a525d5db1`](https://github.com/withastro/astro/commit/a525d5db1746ea6b79fced2a967b82c778320dbf) Thanks [@ryansolid](https://github.com/ryansolid)! - Fix hydration in Solid renderer

## 3.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#7924](https://github.com/withastro/astro/pull/7924) [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae) Thanks [@matthewp](https://github.com/matthewp)! - New `include` and `exclude` config options

  The Solid integration now has new `include` and `exclude` config options. Use these if you want to use Solid alongside another JSX framework; include specifies files to be compiled for Solid and `exclude` does the opposite.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Patch Changes

- [#8264](https://github.com/withastro/astro/pull/8264) [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Automatically unmount islands when `astro:unmount` is fired

## 3.0.0-rc.4

### Patch Changes

- [#8264](https://github.com/withastro/astro/pull/8264) [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Automatically unmount islands when `astro:unmount` is fired

## 3.0.0-rc.3

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 3.0.0-beta.2

### Patch Changes

- [#8107](https://github.com/withastro/astro/pull/8107) [`5b4b78245`](https://github.com/withastro/astro/commit/5b4b782451ba9a7d685d56990b471740616e9610) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update `babel-preset-solid` dependency to `^1.7.7`

## 3.0.0-beta.1

### Major Changes

- [#7924](https://github.com/withastro/astro/pull/7924) [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae) Thanks [@matthewp](https://github.com/matthewp)! - New `include` and `exclude` config options

  The Solid integration now has new `include` and `exclude` config options. Use these if you want to use Solid alongside another JSX framework; include specifies files to be compiled for Solid and `exclude` does the opposite.

## 3.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 2.2.1

### Patch Changes

- [#8107](https://github.com/withastro/astro/pull/8107) [`5b4b78245`](https://github.com/withastro/astro/commit/5b4b782451ba9a7d685d56990b471740616e9610) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update `babel-preset-solid` dependency to `^1.7.7`

## 2.2.0

### Minor Changes

- [#7093](https://github.com/withastro/astro/pull/7093) [`3d525efc9`](https://github.com/withastro/astro/commit/3d525efc95cfb2deb5d9e04856d02965d66901c9) Thanks [@matthewp](https://github.com/matthewp)! - Prevent removal of nested slots within islands

  This change introduces a new flag that renderers can add called `supportsAstroStaticSlot`. What this does is let Astro know that the render is sending `<astro-static-slot>` as placeholder values for static (non-hydrated) slots which Astro will then remove.

  This change is completely backwards compatible, but fixes bugs caused by combining ssr-only and client-side framework components like so:

  ```astro
  <Component>
    <div>
      <Component client:load>
        <span>Nested</span>
      </Component>
    </div>
  </Component>
  ```

### Patch Changes

- [#7101](https://github.com/withastro/astro/pull/7101) [`2994bc52d`](https://github.com/withastro/astro/commit/2994bc52d360bf7ca3681c5f6976e64577cf5209) Thanks [@bluwy](https://github.com/bluwy)! - Always build edge/worker runtime with Vite `webworker` SSR target

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

## 2.1.1

### Patch Changes

- [#6934](https://github.com/withastro/astro/pull/6934) [`b6797fc85`](https://github.com/withastro/astro/commit/b6797fc8583f7cb0749e69e72a56fe9fba6f815b) Thanks [@matthewp](https://github.com/matthewp)! - Allow Solid ecosystem packages to not need special export map configuration. By default Solid is now treated as an external package in SSR, so any other dependent packages will receive the same instance.

## 2.1.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 2.0.2

### Patch Changes

- [#6104](https://github.com/withastro/astro/pull/6104) [`8c80e78dd`](https://github.com/withastro/astro/commit/8c80e78dd5ebfe0528390f42222aadf4786a90fe) Thanks [@yasserhennawi](https://github.com/yasserhennawi)! - Bump vitefu for peerDep warning with Vite 4

## 2.0.1

### Patch Changes

- [#5478](https://github.com/withastro/astro/pull/5478) [`1c7eef308`](https://github.com/withastro/astro/commit/1c7eef308e808aa5ed4662b53e67ec8d1b814d1f) Thanks [@nemo0](https://github.com/nemo0)! - Update READMEs for consistency

## 2.0.0

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

## 2.0.0-beta.0

<details>
<summary>See changes in 2.0.0-beta.0</summary>

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

</details>

## 1.2.3

### Patch Changes

- [#5345](https://github.com/withastro/astro/pull/5345) [`3ae2a961b`](https://github.com/withastro/astro/commit/3ae2a961b77da179d24c44734af54424e76a5049) Thanks [@bluwy](https://github.com/bluwy)! - Respect Vite user config for third-party packages config handling

## 1.2.2

### Patch Changes

- [#5208](https://github.com/withastro/astro/pull/5208) [`c98c5aa0a`](https://github.com/withastro/astro/commit/c98c5aa0aecb4625aeedc2ffdad69f8b2cd2c153) Thanks [@bluwy](https://github.com/bluwy)! - Improve third-party solid packages config handling

## 1.2.1

### Patch Changes

- [#5089](https://github.com/withastro/astro/pull/5089) [`0173c2b2d`](https://github.com/withastro/astro/commit/0173c2b2dfa49b3cb6afec7a411cdbad272b8fde) Thanks [@bluwy](https://github.com/bluwy)! - Suppress warnings for dependency crawling

## 1.2.0

### Minor Changes

- [#5059](https://github.com/withastro/astro/pull/5059) [`f7fcdfe62`](https://github.com/withastro/astro/commit/f7fcdfe6210b3cf08cad92c49b64adf169b9e744) Thanks [@bluwy](https://github.com/bluwy)! - Auto ssr.noExternal solidjs dependencies

## 1.1.1

### Patch Changes

- [#4888](https://github.com/withastro/astro/pull/4888) [`2dc582ac5`](https://github.com/withastro/astro/commit/2dc582ac5e2d6e1d434ccfe21616182e453feec3) Thanks [@AirBorne04](https://github.com/AirBorne04)! - adjusting the build settings for cloudflare (reverting back to platform browser over neutral)
  adjusting the ssr settings for solidjs (to build for node)

## 1.1.0

### Minor Changes

- [#4496](https://github.com/withastro/astro/pull/4496) [`824a2addd`](https://github.com/withastro/astro/commit/824a2adddd09f57ad3f4bd950a1fbf65b6f9d833) Thanks [@mzaien](https://github.com/mzaien)! - Update solid to 1.5

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.4.1

### Patch Changes

- [#3937](https://github.com/withastro/astro/pull/3937) [`31f9c0bf0`](https://github.com/withastro/astro/commit/31f9c0bf029ffa4b470e620f2c32e1370643e81e) Thanks [@delucis](https://github.com/delucis)! - Roll back supported Node engines

## 0.4.0

### Minor Changes

- [#3914](https://github.com/withastro/astro/pull/3914) [`b48767985`](https://github.com/withastro/astro/commit/b48767985359bd359df8071324952ea5f2bc0d86) Thanks [@ran-dall](https://github.com/ran-dall)! - Rollback supported `node@16` version. Minimum versions are now `node@14.20.0` or `node@16.14.0`.

## 0.3.1

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.3.0

### Minor Changes

- [#3871](https://github.com/withastro/astro/pull/3871) [`1cc5b7890`](https://github.com/withastro/astro/commit/1cc5b78905633608e5b07ad291f916f54e67feb1) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update supported `node` versions. Minimum versions are now `node@14.20.0` or `node@16.16.0`.

## 0.2.1

### Patch Changes

- [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

* [`515e8765`](https://github.com/withastro/astro/commit/515e876598c391f3824a82b757042198e0729ca6) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Update peerDependencies to "solid@^1.4.3"

## 0.2.0

### Minor Changes

- [#3652](https://github.com/withastro/astro/pull/3652) [`7373d61c`](https://github.com/withastro/astro/commit/7373d61cdcaedd64bf5fd60521b157cfa4343558) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Add support for passing named slots from `.astro` => framework components.

  Each `slot` is be passed as a top-level prop. For example:

  ```jsx
  // From .astro
  <Component>
    <h2 slot="title">Hello world!</h2>
    <h2 slot="slot-with-dash">Dash</h2>
    <div>Default</div>
  </Component>;

  // For .jsx
  export default function Component({ title, slotWithDash, children }) {
    return (
      <>
        <div id="title">{title}</div>
        <div id="slot-with-dash">{slotWithDash}</div>
        <div id="main">{children}</div>
      </>
    );
  }
  ```

## 0.1.4

### Patch Changes

- [#3505](https://github.com/withastro/astro/pull/3505) [`2b35650b`](https://github.com/withastro/astro/commit/2b35650b5dca28b5cd5dd7c9bb689d0eee6a2ddf) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix newline characters in SolidJS JSX attributes (ex: multiline CSS classes)

## 0.1.3

### Patch Changes

- [#3455](https://github.com/withastro/astro/pull/3455) [`e9a77d86`](https://github.com/withastro/astro/commit/e9a77d861907adccfa75811f9aaa555f186d78f8) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update client hydration to check for `ssr` attribute. Requires `astro@^1.0.0-beta.36`.

## 0.1.2

### Patch Changes

- [#3140](https://github.com/withastro/astro/pull/3140) [`5e28b790`](https://github.com/withastro/astro/commit/5e28b790950bd29f4f7067082ad13b759594509f) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix location of SolidJS pre-hydration code

## 0.1.1

### Patch Changes

- [`815d62f1`](https://github.com/withastro/astro/commit/815d62f151a36fef7d09590d4962ca71bda61b32) Thanks [@FredKSchott](https://github.com/FredKSchott)! - no changes.

## 0.1.0

### Minor Changes

- [#3003](https://github.com/withastro/astro/pull/3003) [`13b782f4`](https://github.com/withastro/astro/commit/13b782f421871af36978f29154c715c66739d475) Thanks [@ryansolid](https://github.com/ryansolid)! - Improve nested hydration with Solid

## 0.0.4-beta.0

### Patch Changes

- [#3003](https://github.com/withastro/astro/pull/3003) [`13b782f4`](https://github.com/withastro/astro/commit/13b782f421871af36978f29154c715c66739d475) Thanks [@ryansolid](https://github.com/ryansolid)! - Improve nested hydration with Solid

## 0.0.3

### Patch Changes

- [#2889](https://github.com/withastro/astro/pull/2889) [`71c12b90`](https://github.com/withastro/astro/commit/71c12b9047c12158c6e4e67ce0494b8d30ac6387) Thanks [@zadeviggers](https://github.com/zadeviggers)! - Correct package name in README. Package is `@astrojs/solid-js`, not `@astrojs/solid`.

## 0.0.2

### Patch Changes

- [#2885](https://github.com/withastro/astro/pull/2885) [`6b004363`](https://github.com/withastro/astro/commit/6b004363f99f27e581d1e2d53a2ebff39d7afb8a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add README across Astro built-in integrations

* [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site

## 0.0.2-next.0

### Patch Changes

- [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site
