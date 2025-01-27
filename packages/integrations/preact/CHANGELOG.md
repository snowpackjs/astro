# @astrojs/preact

## 4.0.3

### Patch Changes

- [#13011](https://github.com/withastro/astro/pull/13011) [`cf30880`](https://github.com/withastro/astro/commit/cf3088060d45227dcb48e041c4ed5e0081d71398) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite

## 4.0.2

### Patch Changes

- [#12887](https://github.com/withastro/astro/pull/12887) [`ea603ae`](https://github.com/withastro/astro/commit/ea603aec80531205d38fed11c525b3faa0271903) Thanks [@louisescher](https://github.com/louisescher)! - Adds a warning message when multiple JSX-based UI frameworks are being used without either the `include` or `exclude` property being set on the integration.

## 4.0.1

### Patch Changes

- [#12799](https://github.com/withastro/astro/pull/12799) [`739dbfb`](https://github.com/withastro/astro/commit/739dbfba4214107cf8fc40c702834dad33eed3b0) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite to pin esbuild

## 4.0.0

### Major Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates Vite dependency to v6 to match Astro v5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

## 4.0.0-beta.1

### Major Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates Vite dependency to v6 to match Astro v5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

## 3.5.4

### Patch Changes

- [#12481](https://github.com/withastro/astro/pull/12481) [`8a46e80`](https://github.com/withastro/astro/commit/8a46e8074d6afb4a23badbd59ed239d526294e8c) Thanks [@marbrex](https://github.com/marbrex)! - Resolve `vite` peer dependency problem for strict package managers like **Yarn in PnP mode**.

## 3.5.3

### Patch Changes

- [#11930](https://github.com/withastro/astro/pull/11930) [`4a44e82`](https://github.com/withastro/astro/commit/4a44e82bbdf0572190618d8c5882c63a6525a198) Thanks [@lukasbachlechner](https://github.com/lukasbachlechner)! - Preact components no longer throw an error if a property is null.

## 3.5.2

### Patch Changes

- [#11834](https://github.com/withastro/astro/pull/11834) [`5f2536b`](https://github.com/withastro/astro/commit/5f2536b51df93bfd51098c48220d647e7ad3954c) Thanks [@ph1p](https://github.com/ph1p)! - Preact signals are now serialized correctly in arrays when they are given to components.

## 3.5.1

### Patch Changes

- [#11464](https://github.com/withastro/astro/pull/11464) [`2cdb685`](https://github.com/withastro/astro/commit/2cdb685ce757fc9932b67b8a52b465296dbaedcd) Thanks [@rschristian](https://github.com/rschristian)! - Swap out `preact-ssr-prepass` for `renderToStringAsync` from `preact-render-to-string`

## 3.5.0

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

## 3.4.0

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

## 3.3.0

### Minor Changes

- [#10938](https://github.com/withastro/astro/pull/10938) [`fd508a0`](https://github.com/withastro/astro/commit/fd508a0fbb5148aafc180f1b14d3e47974777248) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds a `devtools` option

  You can enable [Preact devtools](https://preactjs.github.io/preact-devtools/) in development by setting `devtools: true` in your `preact()` integration config:

  ```js
  import { defineConfig } from 'astro/config';
  import preact from '@astrojs/preact';

  export default defineConfig({
    integrations: [preact({ devtools: true })],
  });
  ```

## 3.2.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

## 3.1.2

### Patch Changes

- [#10585](https://github.com/withastro/astro/pull/10585) [`ad50784adc6f262fc563999e97df3a5dc9087c88`](https://github.com/withastro/astro/commit/ad50784adc6f262fc563999e97df3a5dc9087c88) Thanks [@rschristian](https://github.com/rschristian)! - Fixes (theoretical) edge case in Preact integration's JSX aliases

## 3.1.1

### Patch Changes

- [#10200](https://github.com/withastro/astro/pull/10200) [`c692d0c66a5062937e47402dc700d41c2a5dfc5c`](https://github.com/withastro/astro/commit/c692d0c66a5062937e47402dc700d41c2a5dfc5c) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes passing children to server-rendered components causing an error

## 3.1.0

### Minor Changes

- [#9524](https://github.com/withastro/astro/pull/9524) [`0903ef90494e9c8bd0272347a0cdd51eca7f4648`](https://github.com/withastro/astro/commit/0903ef90494e9c8bd0272347a0cdd51eca7f4648) Thanks [@aleksandrjet](https://github.com/aleksandrjet)! - Allows rendering lazy components.

  You can now use [lazy components](https://preactjs.com/guide/v10/switching-to-preact/#suspense-experimental) with Suspense:

  ```jsx
  import { lazy, Suspense } from 'preact/compat';

  const HeavyComponent = lazy(() => import('./HeavyComponent'));

  const Component = () => {
    return (
      <Suspense fallback={<p>Loading...</p>}>
        <HeavyComponent foo="bar" />
      </Suspense>
    );
  };
  ```

## 3.0.2

### Patch Changes

- [#9482](https://github.com/withastro/astro/pull/9482) [`72b26daf694b213918f02d0fcbf90ab5b7ebc31f`](https://github.com/withastro/astro/commit/72b26daf694b213918f02d0fcbf90ab5b7ebc31f) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improves compatibility with the [Qwik adapter](https://github.com/QwikDev/astro)

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 3.0.1

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

## 3.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#7924](https://github.com/withastro/astro/pull/7924) [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae) Thanks [@matthewp](https://github.com/matthewp)! - New `include` and `exclude` config options

  The Preact integration now has new `include` and `exclude` config options. Use these if you want to use Preact alongside another JSX framework; include specifies files to be compiled for Preact and `exclude` does the opposite.

### Patch Changes

- [#8264](https://github.com/withastro/astro/pull/8264) [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Automatically unmount islands when `astro:unmount` is fired

## 3.0.0-rc.3

### Patch Changes

- [#8264](https://github.com/withastro/astro/pull/8264) [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Automatically unmount islands when `astro:unmount` is fired

## 3.0.0-rc.2

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 3.0.0-beta.1

### Major Changes

- [#7924](https://github.com/withastro/astro/pull/7924) [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae) Thanks [@matthewp](https://github.com/matthewp)! - New `include` and `exclude` config options

  The Preact integration now has new `include` and `exclude` config options. Use these if you want to use Preact alongside another JSX framework; include specifies files to be compiled for Preact and `exclude` does the opposite.

## 3.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 2.2.2

### Patch Changes

- [#8007](https://github.com/withastro/astro/pull/8007) [`58b121d42`](https://github.com/withastro/astro/commit/58b121d42a9f58a5a992f0c378b036f37e9715fc) Thanks [@paperdave](https://github.com/paperdave)! - Support Bun by adjusting how `@babel/plugin-transform-react-jsx` is imported.

## 2.2.1

### Patch Changes

- [#7196](https://github.com/withastro/astro/pull/7196) [`1c77779dd`](https://github.com/withastro/astro/commit/1c77779dd66a6db77c81ed235da076a6118decde) Thanks [@bluwy](https://github.com/bluwy)! - Fix `astro-static-slot` hydration mismatch error

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

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

## 2.1.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 2.0.3

### Patch Changes

- [#6215](https://github.com/withastro/astro/pull/6215) [`a7f18051b`](https://github.com/withastro/astro/commit/a7f18051b118b4f263ed9093ab17ed7eec0e4fd5) Thanks [@matthewp](https://github.com/matthewp)! - Prevent hydration mismatches in Preact

## 2.0.2

### Patch Changes

- [#6108](https://github.com/withastro/astro/pull/6108) [`f9babc38b`](https://github.com/withastro/astro/commit/f9babc38b48049f73a3a282f48d8cb26969cb0a0) Thanks [@matthewp](https://github.com/matthewp)! - Upgrade babel dependency to fix security vuln

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

## 1.2.0

### Minor Changes

- [#5015](https://github.com/withastro/astro/pull/5015) [`b1964e9e1`](https://github.com/withastro/astro/commit/b1964e9e1b7f9178036e266b89d3c8b9cbffd1c6) Thanks [@matthewp](https://github.com/matthewp)! - Shared state in Preact components with signals

  This makes it possible to share client state between Preact islands via signals.

  For example, you can create a signals in an Astro component and then pass it to multiple islands:

  ```astro
  ---
  // Component Imports
  import Counter from '../components/Counter';
  import { signal } from '@preact/signals';
  const count = signal(0);
  ---

  <Count count={count} />
  <Count count={count} />
  ```

## 1.1.1

### Patch Changes

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Add missing dependencies, support strict dependency installation (e.g. pnpm)

## 1.1.0

### Minor Changes

- [#4515](https://github.com/withastro/astro/pull/4515) [`999250d65`](https://github.com/withastro/astro/commit/999250d651996c2833b747b84447aa4e97c91a38) Thanks [@marvinhagemeister](https://github.com/marvinhagemeister)! - Automatically set up Preact DevTools bridge when running `astro dev`.

## 1.0.2

### Patch Changes

- [#4267](https://github.com/withastro/astro/pull/4267) [`5b1facfe2`](https://github.com/withastro/astro/commit/5b1facfe291b998c0c6814293b18df211a8f3cd3) Thanks [@bluwy](https://github.com/bluwy)! - README: Clarify `compat` docs

## 1.0.1

### Patch Changes

- [#4213](https://github.com/withastro/astro/pull/4213) [`f8e385339`](https://github.com/withastro/astro/commit/f8e3853394c2f2f48fac4b5eb2284e1960e59a13) Thanks [@bluwy](https://github.com/bluwy)! - Fix compat support for libraries

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.5.2

### Patch Changes

- [#3937](https://github.com/withastro/astro/pull/3937) [`31f9c0bf0`](https://github.com/withastro/astro/commit/31f9c0bf029ffa4b470e620f2c32e1370643e81e) Thanks [@delucis](https://github.com/delucis)! - Roll back supported Node engines

## 0.5.1

### Patch Changes

- [#3928](https://github.com/withastro/astro/pull/3928) [`d6dfef0ca`](https://github.com/withastro/astro/commit/d6dfef0caa25f4effd0ed548d92ff48ce7a39ab2) Thanks [@matthewp](https://github.com/matthewp)! - Removes @babel/core peerDependency warning

## 0.5.0

### Minor Changes

- [#3914](https://github.com/withastro/astro/pull/3914) [`b48767985`](https://github.com/withastro/astro/commit/b48767985359bd359df8071324952ea5f2bc0d86) Thanks [@ran-dall](https://github.com/ran-dall)! - Rollback supported `node@16` version. Minimum versions are now `node@14.20.0` or `node@16.14.0`.

## 0.4.1

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.4.0

### Minor Changes

- [#3871](https://github.com/withastro/astro/pull/3871) [`1cc5b7890`](https://github.com/withastro/astro/commit/1cc5b78905633608e5b07ad291f916f54e67feb1) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update supported `node` versions. Minimum versions are now `node@14.20.0` or `node@16.16.0`.

## 0.3.2

### Patch Changes

- [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

## 0.3.1

### Patch Changes

- [#3769](https://github.com/withastro/astro/pull/3769) [`b934ab5d`](https://github.com/withastro/astro/commit/b934ab5d860aa3adeec56a9c395f629ee7252ca4) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix "Invalid hook call" warning

## 0.3.0

### Minor Changes

- [#3712](https://github.com/withastro/astro/pull/3712) [`e3fdc9b4`](https://github.com/withastro/astro/commit/e3fdc9b4030b96e815c133a388a7625b7e8e4a2e) Thanks [@delucis](https://github.com/delucis)! - Add support for enabling `preact/compat` to Preact renderer

  To use `preact/compat` to render React components, users can now set `compat` to `true` when using the Preact integration:

  ```js
  integrations: [
    preact({ compat: true }),
  ],
  ```

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

## 0.1.3

### Patch Changes

- [#3455](https://github.com/withastro/astro/pull/3455) [`e9a77d86`](https://github.com/withastro/astro/commit/e9a77d861907adccfa75811f9aaa555f186d78f8) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update client hydration to check for `ssr` attribute. Requires `astro@^1.0.0-beta.36`.

## 0.1.2

### Patch Changes

- [#3166](https://github.com/withastro/astro/pull/3166) [`70263cf7`](https://github.com/withastro/astro/commit/70263cf7481b11e42152c422acc6cfe90fe10ad2) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix integration to use updateConfig rather than returning a partial config object

## 0.1.1

### Patch Changes

- [`815d62f1`](https://github.com/withastro/astro/commit/815d62f151a36fef7d09590d4962ca71bda61b32) Thanks [@FredKSchott](https://github.com/FredKSchott)! - no changes.

## 0.1.0

### Minor Changes

- [#2979](https://github.com/withastro/astro/pull/2979) [`9d7a4b59`](https://github.com/withastro/astro/commit/9d7a4b59b53f8cb274266f5036d1cef841750252) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Welcome to the Astro v1.0.0 Beta! Read the [official announcement](https://astro.build/blog/astro-1-beta-release/) for more details.

## 0.0.2

### Patch Changes

- [#2885](https://github.com/withastro/astro/pull/2885) [`6b004363`](https://github.com/withastro/astro/commit/6b004363f99f27e581d1e2d53a2ebff39d7afb8a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add README across Astro built-in integrations

* [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site

- [#2872](https://github.com/withastro/astro/pull/2872) [`098f6f6b`](https://github.com/withastro/astro/commit/098f6f6b06396441c576dc689d8552629ef260e1) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix `isSelfAccepting` errors when using the Preact integration with the Astro dev server

## 0.0.2-next.1

### Patch Changes

- [#2872](https://github.com/withastro/astro/pull/2872) [`098f6f6b`](https://github.com/withastro/astro/commit/098f6f6b06396441c576dc689d8552629ef260e1) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix `isSelfAccepting` errors when using the Preact integration with the Astro dev server

## 0.0.2-next.0

### Patch Changes

- [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site
