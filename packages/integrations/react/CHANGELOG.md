# @astrojs/react

## 4.2.0

### Minor Changes

- [#13036](https://github.com/withastro/astro/pull/13036) [`3c90d8f`](https://github.com/withastro/astro/commit/3c90d8f3e0baba1463a9022c2e8c777204ad2250) Thanks [@artmsilva](https://github.com/artmsilva)! - Adds experimental support for disabling streaming

  This is useful to support libraries that are not compatible with streaming such as some CSS-in-JS libraries. To disable streaming for all React components in your project, set `experimentalDisableStreaming: true` as a configuration option for `@astrojs/react`:

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  import react from '@astrojs/react';

  export default defineConfig({
    integrations: [
      react({
  +      experimentalDisableStreaming: true,
      }),
    ],
  });
  ```

## 4.1.6

### Patch Changes

- [#12996](https://github.com/withastro/astro/pull/12996) [`80c6801`](https://github.com/withastro/astro/commit/80c6801b4f2b9da44ed69d6da7e4dbd4d65aae69) Thanks [@bluwy](https://github.com/bluwy)! - Removes hardcoded `ssr.external: ['react-dom/server', 'react-dom/client']` config that causes issues with adapters that bundle all dependencies (e.g. Cloudflare). These externals should already be inferred by default by Vite when deploying to a server environment.

- [#13011](https://github.com/withastro/astro/pull/13011) [`cf30880`](https://github.com/withastro/astro/commit/cf3088060d45227dcb48e041c4ed5e0081d71398) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite

## 4.1.5

### Patch Changes

- [#12887](https://github.com/withastro/astro/pull/12887) [`ea603ae`](https://github.com/withastro/astro/commit/ea603aec80531205d38fed11c525b3faa0271903) Thanks [@louisescher](https://github.com/louisescher)! - Adds a warning message when multiple JSX-based UI frameworks are being used without either the `include` or `exclude` property being set on the integration.

## 4.1.4

### Patch Changes

- [#12923](https://github.com/withastro/astro/pull/12923) [`c7642fb`](https://github.com/withastro/astro/commit/c7642fb80b2a2b4d1ec18369b37700ff28b4c041) Thanks [@bluwy](https://github.com/bluwy)! - Removes react-specific entrypoints in `optimizeDeps.include` and rely on `@vitejs/plugin-react` to add

## 4.1.3

### Patch Changes

- [#12948](https://github.com/withastro/astro/pull/12948) [`51ab7b5`](https://github.com/withastro/astro/commit/51ab7b5722acecce722fb404ca6bc152a109c9e5) Thanks [@bluwy](https://github.com/bluwy)! - Supports checking for React 19 components

## 4.1.2

### Patch Changes

- [#12799](https://github.com/withastro/astro/pull/12799) [`739dbfb`](https://github.com/withastro/astro/commit/739dbfba4214107cf8fc40c702834dad33eed3b0) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite to pin esbuild

## 4.1.1

### Patch Changes

- [#12755](https://github.com/withastro/astro/pull/12755) [`391df0e`](https://github.com/withastro/astro/commit/391df0e410aecc4bb8871c42548e2d9634c5ef3a) Thanks [@matthewp](https://github.com/matthewp)! - Preoptimize React compiler runtime

## 4.1.0

### Minor Changes

- [#12678](https://github.com/withastro/astro/pull/12678) [`97c9265`](https://github.com/withastro/astro/commit/97c9265754b78af12ad1e399cc75028435028dfa) Thanks [@bskimball](https://github.com/bskimball)! - Add React 19 stable to peer dependencies

## 4.0.0

### Major Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates Vite dependency to v6 to match Astro v5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

- [#12510](https://github.com/withastro/astro/pull/12510) [`14feaf3`](https://github.com/withastro/astro/commit/14feaf30e1a4266b8422865722a4478d39202404) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Changes the generated URL query param from `_astroAction` to `_action` when submitting a form using Actions. This avoids leaking the framework name into the URL bar, which may be considered a security issue.

## 4.0.0-beta.2

### Major Changes

- [#12524](https://github.com/withastro/astro/pull/12524) [`9f44019`](https://github.com/withastro/astro/commit/9f440196dc39f36fce0198bf4c97131160e5bcc1) Thanks [@bluwy](https://github.com/bluwy)! - Updates Vite dependency to v6 to match Astro v5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

## 3.7.0-beta.1

### Minor Changes

- [#12510](https://github.com/withastro/astro/pull/12510) [`14feaf3`](https://github.com/withastro/astro/commit/14feaf30e1a4266b8422865722a4478d39202404) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Changes the generated URL query param from `_astroAction` to `_action` when submitting a form using Actions. This avoids leaking the framework name into the URL bar, which may be considered a security issue.

## 3.6.3

### Patch Changes

- [#12481](https://github.com/withastro/astro/pull/12481) [`8a46e80`](https://github.com/withastro/astro/commit/8a46e8074d6afb4a23badbd59ed239d526294e8c) Thanks [@marbrex](https://github.com/marbrex)! - Resolve `vite` peer dependency problem for strict package managers like **Yarn in PnP mode**.

## 3.6.2

### Patch Changes

- [#11624](https://github.com/withastro/astro/pull/11624) [`7adb350`](https://github.com/withastro/astro/commit/7adb350a37f3975c8c9db89a32bf63b9fd0b78c2) Thanks [@bluwy](https://github.com/bluwy)! - Prevents throwing errors when checking if a component is a React component in runtime

## 3.6.1

### Patch Changes

- [#11571](https://github.com/withastro/astro/pull/11571) [`1c3265a`](https://github.com/withastro/astro/commit/1c3265a8c9c0b1b1bd597f756b63463146bacc3a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - **BREAKING CHANGE to the experimental Actions API only.** Install the latest `@astrojs/react` integration as well if you're using React 19 features.

  Make `.safe()` the default return value for actions. This means `{ data, error }` will be returned when calling an action directly. If you prefer to get the data while allowing errors to throw, chain the `.orThrow()` modifier.

  ```ts
  import { actions } from 'astro:actions';

  // Before
  const { data, error } = await actions.like.safe();
  // After
  const { data, error } = await actions.like();

  // Before
  const newLikes = await actions.like();
  // After
  const newLikes = await actions.like.orThrow();
  ```

  ## Migration

  To migrate your existing action calls:

  - Remove `.safe` from existing _safe_ action calls
  - Add `.orThrow` to existing _unsafe_ action calls

- [#11570](https://github.com/withastro/astro/pull/11570) [`84189b6`](https://github.com/withastro/astro/commit/84189b6511dc2a14bcfe608696f56a64c2046f39) Thanks [@bholmesdev](https://github.com/bholmesdev)! - **BREAKING CHANGE to the experimental Actions API only.** Install the latest `@astrojs/react` integration as well if you're using React 19 features.

  Updates the Astro Actions fallback to support `action={actions.name}` instead of using `getActionProps().` This will submit a form to the server in zero-JS scenarios using a search parameter:

  ```astro
  ---
  import { actions } from 'astro:actions';
  ---

  <form action={actions.logOut}>
    <!--output: action="?_astroAction=logOut"-->
    <button>Log Out</button>
  </form>
  ```

  You may also construct form action URLs using string concatenation, or by using the `URL()` constructor, with the an action's `.queryString` property:

  ```astro
  ---
  import { actions } from 'astro:actions';

  const confirmationUrl = new URL('/confirmation', Astro.url);
  confirmationUrl.search = actions.queryString;
  ---

  <form method="POST" action={confirmationUrl.pathname}>
    <button>Submit</button>
  </form>
  ```

  ## Migration

  `getActionProps()` is now deprecated. To use the new fallback pattern, remove the `getActionProps()` input from your form and pass your action function to the form `action` attribute:

  ```diff
  ---
  import {
    actions,
  - getActionProps,
  } from 'astro:actions';
  ---

  + <form method="POST" action={actions.logOut}>
  - <form method="POST">
  - <input {...getActionProps(actions.logOut)} />
    <button>Log Out</button>
  </form>
  ```

## 3.6.0

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

## 3.5.0

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

## 3.4.0

### Minor Changes

- [#11071](https://github.com/withastro/astro/pull/11071) [`8ca7c73`](https://github.com/withastro/astro/commit/8ca7c731dea894e77f84b314ebe3a141d5daa918) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Adds two new functions `experimental_getActionState()` and `experimental_withState()` to support [the React 19 `useActionState()` hook](https://react.dev/reference/react/useActionState) when using Astro Actions. This introduces progressive enhancement when calling an Action with the `withState()` utility.

  This example calls a `like` action that accepts a `postId` and returns the number of likes. Pass this action to the `experimental_withState()` function to apply progressive enhancement info, and apply to `useActionState()` to track the result:

  ```tsx
  import { actions } from 'astro:actions';
  import { experimental_withState } from '@astrojs/react/actions';

  export function Like({ postId }: { postId: string }) {
    const [state, action, pending] = useActionState(
      experimental_withState(actions.like),
      0, // initial likes
    );

    return (
      <form action={action}>
        <input type="hidden" name="postId" value={postId} />
        <button disabled={pending}>{state} ❤️</button>
      </form>
    );
  }
  ```

  You can also access the state stored by `useActionState()` from your action `handler`. Call `experimental_getActionState()` with the API context, and optionally apply a type to the result:

  ```ts
  import { defineAction, z } from 'astro:actions';
  import { experimental_getActionState } from '@astrojs/react/actions';

  export const server = {
    like: defineAction({
      input: z.object({
        postId: z.string(),
      }),
      handler: async ({ postId }, ctx) => {
        const currentLikes = experimental_getActionState<number>(ctx);
        // write to database
        return currentLikes + 1;
      },
    }),
  };
  ```

## 3.3.4

### Patch Changes

- [#10986](https://github.com/withastro/astro/pull/10986) [`4d16381`](https://github.com/withastro/astro/commit/4d163811e1a25affb2c3d9adb3af650b7f1c91b6) Thanks [@emish89](https://github.com/emish89)! - Fixes incorrect `peerDependencies` for `@types/react` and `@types/react-dom`

## 3.3.3

### Patch Changes

- [#10942](https://github.com/withastro/astro/pull/10942) [`d47baa4`](https://github.com/withastro/astro/commit/d47baa466aaeedde9c79ed5375d0be34762ac8b6) Thanks [@matthewp](https://github.com/matthewp)! - Updates package to support React 19 beta

## 3.3.2

### Patch Changes

- [#10893](https://github.com/withastro/astro/pull/10893) [`fd7a9ed`](https://github.com/withastro/astro/commit/fd7a9ed3379a123f02f297b69fa5da0053e84a89) Thanks [@Angrigo](https://github.com/Angrigo)! - Removes using deprecated `ReactDOMServer.renderToStaticNodeStream` API

## 3.3.1

### Patch Changes

- [#10855](https://github.com/withastro/astro/pull/10855) [`f6bddd3`](https://github.com/withastro/astro/commit/f6bddd3a155cd10a9f85c92d43b1af8b74786a42) Thanks [@lamATnginx](https://github.com/lamATnginx)! - Fix Redoc usage in React integration

## 3.3.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

## 3.2.0

### Minor Changes

- [#10675](https://github.com/withastro/astro/pull/10675) [`14f1d49a10541fecc4c10def8a094322442ccf23`](https://github.com/withastro/astro/commit/14f1d49a10541fecc4c10def8a094322442ccf23) Thanks [@fightingcat](https://github.com/fightingcat)! - Expose Babel config for @astro/react.

## 3.1.1

### Patch Changes

- [#10654](https://github.com/withastro/astro/pull/10654) [`195f51f82a44df32be73865949aabee0d46ffe61`](https://github.com/withastro/astro/commit/195f51f82a44df32be73865949aabee0d46ffe61) Thanks [@matthewp](https://github.com/matthewp)! - Mark @material-tailwind/react as noExternal

## 3.1.0

### Minor Changes

- [#10136](https://github.com/withastro/astro/pull/10136) [`9cd84bd19b92fb43ae48809f575ee12ebd43ea8f`](https://github.com/withastro/astro/commit/9cd84bd19b92fb43ae48809f575ee12ebd43ea8f) Thanks [@matthewp](https://github.com/matthewp)! - Changes the default behavior of `transition:persist` to update the props of persisted islands upon navigation. Also adds a new view transitions option `transition:persist-props` (default: `false`) to prevent props from updating as needed.

  Islands which have the `transition:persist` property to keep their state when using the `<ViewTransitions />` router will now have their props updated upon navigation. This is useful in cases where the component relies on page-specific props, such as the current page title, which should update upon navigation.

  For example, the component below is set to persist across navigation. This component receives a `products` props and might have some internal state, such as which filters are applied:

  ```astro
  <ProductListing transition:persist products={products} />
  ```

  Upon navigation, this component persists, but the desired `products` might change, for example if you are visiting a category of products, or you are performing a search.

  Previously the props would not change on navigation, and your island would have to handle updating them externally, such as with API calls.

  With this change the props are now updated, while still preserving state.

  You can override this new default behavior on a per-component basis using `transition:persist-props=true` to persist both props and state during navigation:

  ```astro
  <ProductListing transition:persist-props="true" products={products} />
  ```

## 3.0.10

### Patch Changes

- [#9849](https://github.com/withastro/astro/pull/9849) [`20ca3154fb37049cbcd51b06d9fa2ef25ac25a36`](https://github.com/withastro/astro/commit/20ca3154fb37049cbcd51b06d9fa2ef25ac25a36) Thanks [@StandardGage](https://github.com/StandardGage)! - Fixes an issue where passing void elements (img, etc..) did not work with the `experimentalReactChildren` option enabled

## 3.0.9

### Patch Changes

- [#9482](https://github.com/withastro/astro/pull/9482) [`72b26daf694b213918f02d0fcbf90ab5b7ebc31f`](https://github.com/withastro/astro/commit/72b26daf694b213918f02d0fcbf90ab5b7ebc31f) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improves compatibility with the [Qwik adapter](https://github.com/QwikDev/astro)

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 3.0.8

### Patch Changes

- [#9403](https://github.com/withastro/astro/pull/9403) [`7eb9fe8a7`](https://github.com/withastro/astro/commit/7eb9fe8a717dd2b66b1d541e1aa4d3eb5d959ddf) Thanks [@knpwrs](https://github.com/knpwrs)! - Prevents unsupported `forwardRef` components created by Preact from being rendered by React

- [#9452](https://github.com/withastro/astro/pull/9452) [`e83b5095f`](https://github.com/withastro/astro/commit/e83b5095f164f48ba40fc715a805fc66a3e39dcf) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Upgrades vite to latest

## 3.0.7

### Patch Changes

- [#9122](https://github.com/withastro/astro/pull/9122) [`1c48ed286`](https://github.com/withastro/astro/commit/1c48ed286538ab9e354eca4e4dcd7c6385c96721) Thanks [@bluwy](https://github.com/bluwy)! - Adds Vite 5 support. There are no breaking changes from Astro. Check the [Vite migration guide](https://vite.dev/guide/migration.html) for details of the breaking changes from Vite instead.

## 3.0.7-beta.0

### Patch Changes

- [#9122](https://github.com/withastro/astro/pull/9122) [`1c48ed286`](https://github.com/withastro/astro/commit/1c48ed286538ab9e354eca4e4dcd7c6385c96721) Thanks [@bluwy](https://github.com/bluwy)! - Adds Vite 5 support. There are no breaking changes from Astro. Check the [Vite migration guide](https://vite.dev/guide/migration.html) for details of the breaking changes from Vite instead.

## 3.0.6

### Patch Changes

- [#9141](https://github.com/withastro/astro/pull/9141) [`af43fb517`](https://github.com/withastro/astro/commit/af43fb51726fa2242cec03cb019fa4fa4a4403ef) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where slotting self-closing elements (img, br, hr) into react components with `experimentalReactChildren` enabled led to an error.

## 3.0.5

### Patch Changes

- [#8925](https://github.com/withastro/astro/pull/8925) [`ac5633b8f`](https://github.com/withastro/astro/commit/ac5633b8f615fe90ea419e00c5c771d00783a6e2) Thanks [@brandonsdebt](https://github.com/brandonsdebt)! - Uses `node:stream` during server rendering for compatibility with Cloudflare

## 3.0.4

### Patch Changes

- [#8898](https://github.com/withastro/astro/pull/8898) [`4dee38711`](https://github.com/withastro/astro/commit/4dee38711cbf83efb5e12fbfa8e69e2495c49acf) Thanks [@matthewp](https://github.com/matthewp)! - Fixes client hydration in islands when using experimentalReactChildren

## 3.0.3

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

## 3.0.2

### Patch Changes

- [#8455](https://github.com/withastro/astro/pull/8455) [`85fe213fe`](https://github.com/withastro/astro/commit/85fe213fe0e8de3227ac80a41119800c374214f6) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update `experimentalReactChildren` behavior to support void tags

## 3.0.1

### Patch Changes

- [#8428](https://github.com/withastro/astro/pull/8428) [`67e834859`](https://github.com/withastro/astro/commit/67e83485949cf21de62831731111413abf57718c) Thanks [@matthewp](https://github.com/matthewp)! - Fix React dev mode using a base

## 3.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#7924](https://github.com/withastro/astro/pull/7924) [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae) Thanks [@matthewp](https://github.com/matthewp)! - Support for React Refresh

  The React integration now fully supports React Refresh and is backed by `@vitejs/plugin-react`.

  Also included in this change are new `include` and `exclude` config options. Use these if you want to use React alongside another JSX framework; include specifies files to be compiled for React and `exclude` does the opposite.

### Patch Changes

- [#8228](https://github.com/withastro/astro/pull/8228) [`4bd2fac8d`](https://github.com/withastro/astro/commit/4bd2fac8da4efb7c532d8920077df1f61d6e1953) Thanks [@bluwy](https://github.com/bluwy)! - Publish missing `vnode-children.js` file

- [#8264](https://github.com/withastro/astro/pull/8264) [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Automatically unmount islands when `astro:unmount` is fired

- Updated dependencies [[`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312), [`2aa6d8ace`](https://github.com/withastro/astro/commit/2aa6d8ace398a41c2dec5473521d758816b08191), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7)]:
  - @astrojs/internal-helpers@0.2.0

## 3.0.0-rc.6

### Patch Changes

- [#8264](https://github.com/withastro/astro/pull/8264) [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Automatically unmount islands when `astro:unmount` is fired

## 3.0.0-rc.5

### Patch Changes

- [#8228](https://github.com/withastro/astro/pull/8228) [`4bd2fac8d`](https://github.com/withastro/astro/commit/4bd2fac8da4efb7c532d8920077df1f61d6e1953) Thanks [@bluwy](https://github.com/bluwy)! - Publish missing `vnode-children.js` file

## 3.0.0-rc.4

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Patch Changes

- Updated dependencies [[`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7)]:
  - @astrojs/internal-helpers@0.2.0-rc.2

## 3.0.0-beta.3

### Minor Changes

- [#8082](https://github.com/withastro/astro/pull/8082) [`16a3fdf93`](https://github.com/withastro/astro/commit/16a3fdf93165a1a0404c1db0973871345b2c591b) Thanks [@matthewp](https://github.com/matthewp)! - Optionally parse React slots as React children.

  This adds a new configuration option for the React integration `experimentalReactChildren`:

  ```js
  export default {
    integrations: [
      react({
        experimentalReactChildren: true,
      }),
    ],
  };
  ```

  With this enabled, children passed to React from Astro components via the default slot are parsed as React components.

  This enables better compatibility with certain React components which manipulate their children.

## 3.0.0-beta.2

### Patch Changes

- Updated dependencies [[`2aa6d8ace`](https://github.com/withastro/astro/commit/2aa6d8ace398a41c2dec5473521d758816b08191)]:
  - @astrojs/internal-helpers@0.2.0-beta.1

## 3.0.0-beta.1

### Major Changes

- [#7924](https://github.com/withastro/astro/pull/7924) [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae) Thanks [@matthewp](https://github.com/matthewp)! - Support for React Refresh

  The React integration now fully supports React Refresh and is backed by `@vitejs/plugin-react`.

  Also included in this change are new `include` and `exclude` config options. Use these if you want to use React alongside another JSX framework; include specifies files to be compiled for React and `exclude` does the opposite.

## 3.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 2.3.2

### Patch Changes

- [#8149](https://github.com/withastro/astro/pull/8149) [`531cc3e49`](https://github.com/withastro/astro/commit/531cc3e490bc3bc1b896eeaec05664571df5bb24) Thanks [@matthewp](https://github.com/matthewp)! - Fix missing package file regression

## 2.3.1

### Patch Changes

- [#8137](https://github.com/withastro/astro/pull/8137) [`8c0a4ed10`](https://github.com/withastro/astro/commit/8c0a4ed106efeda286f0aae8b959008f9462b5ec) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix missing export for new `experimentalReactChildren` option

## 2.3.0

### Minor Changes

- [#8082](https://github.com/withastro/astro/pull/8082) [`16a3fdf93`](https://github.com/withastro/astro/commit/16a3fdf93165a1a0404c1db0973871345b2c591b) Thanks [@matthewp](https://github.com/matthewp)! - Optionally parse React slots as React children.

  This adds a new configuration option for the React integration `experimentalReactChildren`:

  ```js
  export default {
    integrations: [
      react({
        experimentalReactChildren: true,
      }),
    ],
  };
  ```

  With this enabled, children passed to React from Astro components via the default slot are parsed as React components.

  This enables better compatibility with certain React components which manipulate their children.

## 2.2.2

### Patch Changes

- [#8075](https://github.com/withastro/astro/pull/8075) [`da517d405`](https://github.com/withastro/astro/commit/da517d4055825ee1b630cd4a6983818d6120a7b7) Thanks [@SudoCat](https://github.com/SudoCat)! - fix a bug where react identifierPrefix was set to null for client:only components causing React.useId to generate ids prefixed with null

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

## 2.1.3

### Patch Changes

- [#6976](https://github.com/withastro/astro/pull/6976) [`ca329bbca`](https://github.com/withastro/astro/commit/ca329bbcae7a6075af4f428f6f64466e9d152c8f) Thanks [@SudoCat](https://github.com/SudoCat)! - Prevent ID collisions in React.useId

## 2.1.2

### Patch Changes

- [#6933](https://github.com/withastro/astro/pull/6933) [`649d70934`](https://github.com/withastro/astro/commit/649d70934e709bb1aa6e5e7583b12fa1703377cb) Thanks [@matthewp](https://github.com/matthewp)! - Automatically configure redoc

## 2.1.1

### Patch Changes

- [#6698](https://github.com/withastro/astro/pull/6698) [`fc71c3f18`](https://github.com/withastro/astro/commit/fc71c3f18819ac3ad62809a7eeff5fe7840f2c4b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update React README to reference the [new React docs](https://react.dev)

- [#6696](https://github.com/withastro/astro/pull/6696) [`239b9a2fb`](https://github.com/withastro/astro/commit/239b9a2fb864fa785e4150cd8aa833de72dd3517) Thanks [@matthewp](https://github.com/matthewp)! - Add use-immer as a noExternal module

## 2.1.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 2.0.2

### Patch Changes

- [#5478](https://github.com/withastro/astro/pull/5478) [`1c7eef308`](https://github.com/withastro/astro/commit/1c7eef308e808aa5ed4662b53e67ec8d1b814d1f) Thanks [@nemo0](https://github.com/nemo0)! - Update READMEs for consistency

## 2.0.1

### Patch Changes

- [#5886](https://github.com/withastro/astro/pull/5886) [`9d4bfc76e`](https://github.com/withastro/astro/commit/9d4bfc76e8de7cf85997100145532a6fa7d2b025) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Support passing `children` as props to a React component

## 2.0.0

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

## 2.0.0-beta.0

<details>
<summary>See changes in 2.0.0-beta.0</summary>

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

</details>

## 1.2.2

### Patch Changes

- [#5218](https://github.com/withastro/astro/pull/5218) [`0b1241431`](https://github.com/withastro/astro/commit/0b12414315fa81ded96587779c63c74400466078) Thanks [@MoustaphaDev](https://github.com/MoustaphaDev)! - remove unnecessary `ReactDOM.renderToString` operation

## 1.2.1

### Patch Changes

- [#5095](https://github.com/withastro/astro/pull/5095) [`ddfbef5ac`](https://github.com/withastro/astro/commit/ddfbef5acbd4c56d8ce1626a458b5cbb27da47fe) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add `@types/` packages as peerDependencies

## 1.2.0

### Minor Changes

- [#5016](https://github.com/withastro/astro/pull/5016) [`6efeaeb39`](https://github.com/withastro/astro/commit/6efeaeb39ed7e6642b31603745750ccb9fe0ff1e) Thanks [@matthewp](https://github.com/matthewp)! - Add support for mui

  This adds support for [mui](https://mui.com/) through configuration. Users will now not need to configure this library to get it to work.

## 1.1.4

### Patch Changes

- [#4816](https://github.com/withastro/astro/pull/4816) [`8d059faae`](https://github.com/withastro/astro/commit/8d059faaedf212426e0fb6d93843f6855f723f56) Thanks [@matthewp](https://github.com/matthewp)! - Prevent errors in React components from crashing the dev server

## 1.1.3

### Patch Changes

- [#4756](https://github.com/withastro/astro/pull/4756) [`c271ed35e`](https://github.com/withastro/astro/commit/c271ed35ee634f2f8c9957ee04a3aadc7dd39b3e) Thanks [@matthewp](https://github.com/matthewp)! - Only pass through children prop if there are children

## 1.1.2

### Patch Changes

- [#4679](https://github.com/withastro/astro/pull/4679) [`5986517b4`](https://github.com/withastro/astro/commit/5986517b4f29af90fcfe333d4bb69ac09d4f8778) Thanks [@matthewp](https://github.com/matthewp)! - Prevent decoder from leaking

- [#4667](https://github.com/withastro/astro/pull/4667) [`9290b2414`](https://github.com/withastro/astro/commit/9290b24143d753edd3daf25945990c25a58e5bde) Thanks [@Holben888](https://github.com/Holben888)! - Fix framework components on Vercel Edge

## 1.1.1

### Patch Changes

- [#4527](https://github.com/withastro/astro/pull/4527) [`9adb7cca3`](https://github.com/withastro/astro/commit/9adb7cca33f669082d0daf750b97b1496ee79d2f) Thanks [@bluwy](https://github.com/bluwy)! - Add vite-ignore comment to suppress unknown import warnings

## 1.1.0

### Minor Changes

- [#4478](https://github.com/withastro/astro/pull/4478) [`243525b15`](https://github.com/withastro/astro/commit/243525b1565385753ae1464c5def0d7de799f906) Thanks [@matthewp](https://github.com/matthewp)! - Uses startTransition on React roots

  This prevents hydration from blocking the main thread when multiple islands are rendering at the same time.

## 1.1.0-next.0

### Minor Changes

- [#4478](https://github.com/withastro/astro/pull/4478) [`243525b15`](https://github.com/withastro/astro/commit/243525b1565385753ae1464c5def0d7de799f906) Thanks [@matthewp](https://github.com/matthewp)! - Uses startTransition on React roots

  This prevents hydration from blocking the main thread when multiple islands are rendering at the same time.

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.4.3

### Patch Changes

- [#4174](https://github.com/withastro/astro/pull/4174) [`8eb3a8c6d`](https://github.com/withastro/astro/commit/8eb3a8c6d9554707963c3a3bc36ed8b68d3cf0fb) Thanks [@matthewp](https://github.com/matthewp)! - Allows using React with automatic imports alongside MDX

## 0.4.2

### Patch Changes

- [#3937](https://github.com/withastro/astro/pull/3937) [`31f9c0bf0`](https://github.com/withastro/astro/commit/31f9c0bf029ffa4b470e620f2c32e1370643e81e) Thanks [@delucis](https://github.com/delucis)! - Roll back supported Node engines

## 0.4.1

### Patch Changes

- [#3928](https://github.com/withastro/astro/pull/3928) [`d6dfef0ca`](https://github.com/withastro/astro/commit/d6dfef0caa25f4effd0ed548d92ff48ce7a39ab2) Thanks [@matthewp](https://github.com/matthewp)! - Removes @babel/core peerDependency warning

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

- [#3337](https://github.com/withastro/astro/pull/3337) [`678c2b75`](https://github.com/withastro/astro/commit/678c2b7523c7f10cfdf2eb5a73aa2bbb7e5cbc07) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: remove hydration failures on React v18 by exposing the "client" directive from Astro core.

## 0.1.1

### Patch Changes

- [#3160](https://github.com/withastro/astro/pull/3160) [`ae9ac5cb`](https://github.com/withastro/astro/commit/ae9ac5cbdceba0687d83d56d9d5f80479ab88710) Thanks [@matthewp](https://github.com/matthewp)! - Allows using React.lazy, Suspense in SSR and with hydration

## 0.1.0

### Minor Changes

- [`e425f896`](https://github.com/withastro/astro/commit/e425f896b668d98033ad3b998b50c1f28bc7f6ee) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Add support for React v18

## 0.0.2

### Patch Changes

- [#2885](https://github.com/withastro/astro/pull/2885) [`6b004363`](https://github.com/withastro/astro/commit/6b004363f99f27e581d1e2d53a2ebff39d7afb8a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add README across Astro built-in integrations

* [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site

## 0.0.2-next.0

### Patch Changes

- [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site
