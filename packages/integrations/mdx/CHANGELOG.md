# @astrojs/mdx

## 4.0.8

### Patch Changes

- Updated dependencies [[`db252e0`](https://github.com/withastro/astro/commit/db252e0692a0addf7239bfefc0220c525d63337d)]:
  - @astrojs/markdown-remark@6.1.0

## 4.0.7

### Patch Changes

- [#13011](https://github.com/withastro/astro/pull/13011) [`cf30880`](https://github.com/withastro/astro/commit/cf3088060d45227dcb48e041c4ed5e0081d71398) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite

## 4.0.6

### Patch Changes

- Updated dependencies [[`3d89e62`](https://github.com/withastro/astro/commit/3d89e6282235a8da45d9ddfe02bcf7ec78056941)]:
  - @astrojs/markdown-remark@6.0.2

## 4.0.5

### Patch Changes

- [#12959](https://github.com/withastro/astro/pull/12959) [`3a267f3`](https://github.com/withastro/astro/commit/3a267f33a2a2576c9065c88646ed67f5a7a8ba0b) Thanks [@bluwy](https://github.com/bluwy)! - Reverts https://github.com/withastro/astro/commit/9a3b48c5c3e8f597159454f06c5a0ce8e709bc50 which caused a regression for rendering inline MDX components and MDX files from content collections

## 4.0.4

### Patch Changes

- [#12921](https://github.com/withastro/astro/pull/12921) [`aeb7e1a`](https://github.com/withastro/astro/commit/aeb7e1ac11ebf87847ed2fac89072aa2b4ac2aae) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes a bug that caused Image component to be imported on MDX pages that did not include images

- [#12913](https://github.com/withastro/astro/pull/12913) [`9a3b48c`](https://github.com/withastro/astro/commit/9a3b48c5c3e8f597159454f06c5a0ce8e709bc50) Thanks [@bluwy](https://github.com/bluwy)! - Makes internal `check()` function a no-op to allow faster component renders and prevent React 19 component warnings

## 4.0.3

### Patch Changes

- [#12799](https://github.com/withastro/astro/pull/12799) [`739dbfb`](https://github.com/withastro/astro/commit/739dbfba4214107cf8fc40c702834dad33eed3b0) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite to pin esbuild

## 4.0.2

### Patch Changes

- Updated dependencies [[`f13417b`](https://github.com/withastro/astro/commit/f13417bfbf73130c224752379e2da33084f89554), [`87231b1`](https://github.com/withastro/astro/commit/87231b1168da66bb593f681206c42fa555dfcabc), [`a71e9b9`](https://github.com/withastro/astro/commit/a71e9b93b317edc0ded49d4d50f1b7841c8cd428)]:
  - @astrojs/markdown-remark@6.0.1

## 4.0.1

### Patch Changes

- [#12594](https://github.com/withastro/astro/pull/12594) [`4f2fd0a`](https://github.com/withastro/astro/commit/4f2fd0a0d67a748af8b611b9afc7d4c789f7c8cc) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes compatibility with Astro 5

## 4.0.0

### Major Changes

- [#12231](https://github.com/withastro/astro/pull/12231) [`90ae100`](https://github.com/withastro/astro/commit/90ae100cf482529828febed591172433309bc12e) Thanks [@bluwy](https://github.com/bluwy)! - Handles the breaking change in Astro where content pages (including `.mdx` pages located within `src/pages/`) no longer respond with `charset=utf-8` in the `Content-Type` header.

  For MDX pages without layouts, `@astrojs/mdx` will automatically add the `<meta charset="utf-8">` tag to the page by default. This reduces the boilerplate needed to write with non-ASCII characters. If your MDX pages have a layout, the layout component should include the `<meta charset="utf-8">` tag.

  If you require `charset=utf-8` to render your page correctly, make sure that your layout components have the `<meta charset="utf-8">` tag added.

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

- [#11741](https://github.com/withastro/astro/pull/11741) [`6617491`](https://github.com/withastro/astro/commit/6617491c3bc2bde87f7867d7dec2580781852cfc) Thanks [@bluwy](https://github.com/bluwy)! - Updates adapter server entrypoint to use `@astrojs/mdx/server.js`

  This is an internal change. Handling JSX in your `.mdx` files has been moved from Astro internals and is now the responsibility of this integration. You should not notice a change in your project, and no update to your code is required.

### Patch Changes

- [#12075](https://github.com/withastro/astro/pull/12075) [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819) Thanks [@bluwy](https://github.com/bluwy)! - Parses frontmatter ourselves

- [#11861](https://github.com/withastro/astro/pull/11861) [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59) Thanks [@bluwy](https://github.com/bluwy)! - Updates `@astrojs/markdown-remark` and handle its breaking changes

- [#12533](https://github.com/withastro/astro/pull/12533) [`1b61fdf`](https://github.com/withastro/astro/commit/1b61fdf038d2627c6dad1a7f1426f60a4616ad93) Thanks [@ematipico](https://github.com/ematipico)! - Fixes a case where the MDX renderer couldn't be loaded when used as a direct dependency of an Astro integration.

- Updated dependencies [[`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59), [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255), [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce), [`83a2a64`](https://github.com/withastro/astro/commit/83a2a648418ad30f4eb781d1c1b5f2d8a8ac846e), [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59), [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819)]:
  - @astrojs/markdown-remark@6.0.0

## 4.0.0-beta.5

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

### Patch Changes

- Updated dependencies []:
  - @astrojs/markdown-remark@6.0.0-beta.3

## 4.0.0-beta.4

### Patch Changes

- [#12533](https://github.com/withastro/astro/pull/12533) [`1b61fdf`](https://github.com/withastro/astro/commit/1b61fdf038d2627c6dad1a7f1426f60a4616ad93) Thanks [@ematipico](https://github.com/ematipico)! - Fixes a case where the MDX renderer couldn't be loaded when used as a direct dependency of an Astro integration.

## 4.0.0-beta.3

### Major Changes

- [#12231](https://github.com/withastro/astro/pull/12231) [`90ae100`](https://github.com/withastro/astro/commit/90ae100cf482529828febed591172433309bc12e) Thanks [@bluwy](https://github.com/bluwy)! - Handles the breaking change in Astro where content pages (including `.mdx` pages located within `src/pages/`) no longer respond with `charset=utf-8` in the `Content-Type` header.

  For MDX pages without layouts, `@astrojs/mdx` will automatically add the `<meta charset="utf-8">` tag to the page by default. This reduces the boilerplate needed to write with non-ASCII characters. If your MDX pages have a layout, the layout component should include the `<meta charset="utf-8">` tag.

  If you require `charset=utf-8` to render your page correctly, make sure that your layout components have the `<meta charset="utf-8">` tag added.

## 4.0.0-alpha.2

### Patch Changes

- [#11861](https://github.com/withastro/astro/pull/11861) [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59) Thanks [@bluwy](https://github.com/bluwy)! - Updates `@astrojs/markdown-remark` and handle its breaking changes

- Updated dependencies [[`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59), [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce), [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59)]:
  - @astrojs/markdown-remark@6.0.0-alpha.1

## 4.0.0-alpha.1

### Minor Changes

- [#11741](https://github.com/withastro/astro/pull/11741) [`6617491`](https://github.com/withastro/astro/commit/6617491c3bc2bde87f7867d7dec2580781852cfc) Thanks [@bluwy](https://github.com/bluwy)! - Updates adapter server entrypoint to use `@astrojs/mdx/server.js`

  This is an internal change. Handling JSX in your `.mdx` files has been moved from Astro internals and is now the responsibility of this integration. You should not notice a change in your project, and no update to your code is required.

## 4.0.0-alpha.0

- Updated dependencies [[`b6fbdaa`](https://github.com/withastro/astro/commit/b6fbdaa94a9ecec706a99e1938fbf5cd028c72e0), [`89bab1e`](https://github.com/withastro/astro/commit/89bab1e70786123fbe933a9d7a1b80c9334dcc5f), [`d74617c`](https://github.com/withastro/astro/commit/d74617cbd3278feba05909ec83db2d73d57a153e), [`83a2a64`](https://github.com/withastro/astro/commit/83a2a648418ad30f4eb781d1c1b5f2d8a8ac846e), [`e90f559`](https://github.com/withastro/astro/commit/e90f5593d23043579611452a84b9e18ad2407ef9), [`2df49a6`](https://github.com/withastro/astro/commit/2df49a6fb4f6d92fe45f7429430abe63defeacd6), [`8a53517`](https://github.com/withastro/astro/commit/8a5351737d6a14fc55f1dafad8f3b04079e81af6)]:
  - astro@5.0.0-alpha.0
  - @astrojs/markdown-remark@6.0.0-alpha.0

## 3.1.9

### Patch Changes

- [#12245](https://github.com/withastro/astro/pull/12245) [`1d4f6a4`](https://github.com/withastro/astro/commit/1d4f6a4989bc1cfd7109b1bff41503f115660e02) Thanks [@bmenant](https://github.com/bmenant)! - Add `components` property to MDXInstance type definition (RenderResult and module import)

## 3.1.8

### Patch Changes

- Updated dependencies [[`710a1a1`](https://github.com/withastro/astro/commit/710a1a11f488ff6ed3da6d3e0723b2322ccfe27b)]:
  - @astrojs/markdown-remark@5.3.0

## 3.1.7

### Patch Changes

- [#12026](https://github.com/withastro/astro/pull/12026) [`40e7a1b`](https://github.com/withastro/astro/commit/40e7a1b05d9e5ea3fcda176c9663bbcff86edb63) Thanks [@bluwy](https://github.com/bluwy)! - Initializes the MDX processor only when there's `.mdx` files

## 3.1.6

### Patch Changes

- [#11975](https://github.com/withastro/astro/pull/11975) [`c9ae7b1`](https://github.com/withastro/astro/commit/c9ae7b1b89e050900bbc111f29e8c5d95c26bf36) Thanks [@bluwy](https://github.com/bluwy)! - Handles nested root hast node when optimizing MDX

## 3.1.5

### Patch Changes

- [#11818](https://github.com/withastro/astro/pull/11818) [`88ef1d0`](https://github.com/withastro/astro/commit/88ef1d0e774e8ab8798b9912da1b069f97736623) Thanks [@bluwy](https://github.com/bluwy)! - Fixes CSS in the layout component to be ordered first before any other components in the MDX file

## 3.1.4

### Patch Changes

- [#11717](https://github.com/withastro/astro/pull/11717) [`423614e`](https://github.com/withastro/astro/commit/423614ebb6ddb76cc8d11f3e3b6ae111a4a82662) Thanks [@bluwy](https://github.com/bluwy)! - Fixes stack trace location when failed to parse an MDX file with frontmatter

## 3.1.3

### Patch Changes

- Updated dependencies [[`49b5145`](https://github.com/withastro/astro/commit/49b5145158a603b9bb951bf914a6a9780c218704)]:
  - @astrojs/markdown-remark@5.2.0

## 3.1.2

### Patch Changes

- Updated dependencies [[`b6afe6a`](https://github.com/withastro/astro/commit/b6afe6a782f68f4a279463a144baaf99cb96b6dc)]:
  - @astrojs/markdown-remark@5.1.1

## 3.1.1

### Patch Changes

- [#11263](https://github.com/withastro/astro/pull/11263) [`7d59750`](https://github.com/withastro/astro/commit/7d597506615fa5a34327304e8321be7b9c4b799d) Thanks [@wackbyte](https://github.com/wackbyte)! - Refactor to use Astro's integration logger for logging

## 3.1.0

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

## 3.0.1

### Patch Changes

- [#10813](https://github.com/withastro/astro/pull/10813) [`3cc3e2c`](https://github.com/withastro/astro/commit/3cc3e2ccba062749a6bd8469bc88ff797bea0abc) Thanks [@Xetera](https://github.com/Xetera)! - Omitting compiler-internal symbol from user components to fix breaking error messages

## 3.0.0

### Major Changes

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Refactors the MDX transformation to rely only on the unified pipeline. Babel and esbuild transformations are removed, which should result in faster build times. The refactor requires using Astro v4.8.0 but no other changes are necessary.

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Allows integrations after the MDX integration to update `markdown.remarkPlugins` and `markdown.rehypePlugins`, and have the plugins work in MDX too.

  If your integration relies on Astro's previous behavior that prevents integrations from adding remark/rehype plugins for MDX, you will now need to configure `@astrojs/mdx` with `extendMarkdownConfig: false` and explicitly specify any `remarkPlugins` and `rehypePlugins` options instead.

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Renames the `optimize.customComponentNames` option to `optimize.ignoreElementNames` to better reflect its usecase. Its behaviour is not changed and should continue to work as before.

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Replaces the internal `remark-images-to-component` plugin with `rehype-images-to-component` to let users use additional rehype plugins for images

### Patch Changes

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Simplifies plain MDX components as hast element nodes to further improve HTML string inlining for the `optimize` option

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Allows Vite plugins to transform `.mdx` files before the MDX plugin transforms it

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Updates the `optimize` option to group static sibling nodes as a `<Fragment />`. This reduces the number of AST nodes and simplifies runtime rendering of MDX pages.

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Tags the MDX component export for quicker component checks while rendering

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Fixes `export const components` keys detection for the `optimize` option

- [#10935](https://github.com/withastro/astro/pull/10935) [`ddd8e49`](https://github.com/withastro/astro/commit/ddd8e49d1a179bec82310fb471f822a1567a6610) Thanks [@bluwy](https://github.com/bluwy)! - Improves `optimize` handling for MDX components with attributes and inline MDX components

## 2.3.1

### Patch Changes

- [#10754](https://github.com/withastro/astro/pull/10754) [`3e7a12c8532411e580fcfdb8445cad8fc8499291`](https://github.com/withastro/astro/commit/3e7a12c8532411e580fcfdb8445cad8fc8499291) Thanks [@rishi-raj-jain](https://github.com/rishi-raj-jain)! - Fixes an issue where images in MDX required a relative specifier (e.g. `./`)

  Now, you can use the standard `![](img.png)` syntax in MDX files for images colocated in the same folder: no relative specifier required!

  There is no need to update your project; your existing images will still continue to work. However, you may wish to remove any relative specifiers from these MDX images as they are no longer necessary:

  ```diff
  - ![A cute dog](./dog.jpg)
  + ![A cute dog](dog.jpg)
  <!-- This dog lives in the same folder as my article! -->
  ```

- [#10770](https://github.com/withastro/astro/pull/10770) [`88ee63a3ba4488c60348cb821034e6d4a057efd0`](https://github.com/withastro/astro/commit/88ee63a3ba4488c60348cb821034e6d4a057efd0) Thanks [@bluwy](https://github.com/bluwy)! - Removes internal MDX processor on `buildEnd` to free up memory

## 2.3.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

### Patch Changes

- Updated dependencies [[`ccafa8d230f65c9302421a0ce0a0adc5824bfd55`](https://github.com/withastro/astro/commit/ccafa8d230f65c9302421a0ce0a0adc5824bfd55)]:
  - @astrojs/markdown-remark@5.1.0

## 2.2.4

### Patch Changes

- [#10673](https://github.com/withastro/astro/pull/10673) [`db7f9c87035a0de780536d95cdd9facff00c3c08`](https://github.com/withastro/astro/commit/db7f9c87035a0de780536d95cdd9facff00c3c08) Thanks [@bluwy](https://github.com/bluwy)! - Removes unnecessary internal `recmaInjectImportMetaEnv` plugin

## 2.2.3

### Patch Changes

- Updated dependencies [[`2cf116f80cb5e421ab5cc5eb4a654e7b78c1b8de`](https://github.com/withastro/astro/commit/2cf116f80cb5e421ab5cc5eb4a654e7b78c1b8de), [`374efcdff9625ca43309d89e3b9cfc9174351512`](https://github.com/withastro/astro/commit/374efcdff9625ca43309d89e3b9cfc9174351512)]:
  - @astrojs/markdown-remark@5.0.0

## 2.2.2

### Patch Changes

- Updated dependencies [[`c585528f446ccca3d4c643f4af5d550b93c18902`](https://github.com/withastro/astro/commit/c585528f446ccca3d4c643f4af5d550b93c18902)]:
  - @astrojs/markdown-remark@4.3.2

## 2.2.1

### Patch Changes

- Updated dependencies [[`19e42c368184013fc30d1e46753b9e9383bb2bdf`](https://github.com/withastro/astro/commit/19e42c368184013fc30d1e46753b9e9383bb2bdf)]:
  - @astrojs/markdown-remark@4.3.1

## 2.2.0

### Minor Changes

- [#10104](https://github.com/withastro/astro/pull/10104) [`a31bbd7ff8f3ec62ee507f72d1d25140b82ffc18`](https://github.com/withastro/astro/commit/a31bbd7ff8f3ec62ee507f72d1d25140b82ffc18) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Changes Astro's internal syntax highlighting to use rehype plugins instead of remark plugins. This provides better interoperability with other [rehype plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins) that deal with code blocks, in particular with third party syntax highlighting plugins and [`rehype-mermaid`](https://github.com/remcohaszing/rehype-mermaid).

  This may be a breaking change if you are currently using:

  - a remark plugin that relies on nodes of type `html`
  - a rehype plugin that depends on nodes of type `raw`.

  Please review your rendered code samples carefully, and if necessary, consider using a rehype plugin that deals with the generated `element` nodes instead. You can transform the AST of raw HTML strings, or alternatively use [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html) to get a string from a `raw` node.

### Patch Changes

- Updated dependencies [[`c081adf998d30419fed97d8fccc11340cdc512e0`](https://github.com/withastro/astro/commit/c081adf998d30419fed97d8fccc11340cdc512e0), [`5a9528741fa98d017b269c7e4f013058028bdc5d`](https://github.com/withastro/astro/commit/5a9528741fa98d017b269c7e4f013058028bdc5d), [`a31bbd7ff8f3ec62ee507f72d1d25140b82ffc18`](https://github.com/withastro/astro/commit/a31bbd7ff8f3ec62ee507f72d1d25140b82ffc18)]:
  - @astrojs/markdown-remark@4.3.0

## 2.1.1

### Patch Changes

- Updated dependencies [[`44c957f893c6bf5f5b7c78301de7b21c5975584d`](https://github.com/withastro/astro/commit/44c957f893c6bf5f5b7c78301de7b21c5975584d)]:
  - @astrojs/markdown-remark@4.2.1

## 2.1.0

### Minor Changes

- [#9753](https://github.com/withastro/astro/pull/9753) [`df37366556d46f7abdf82b09e33b08bd94e631b3`](https://github.com/withastro/astro/commit/df37366556d46f7abdf82b09e33b08bd94e631b3) Thanks [@OliverSpeir](https://github.com/OliverSpeir)! - Allows remark plugins to pass options specifying how images in .mdx files will be optimized

## 2.0.6

### Patch Changes

- Updated dependencies [[`53c69dcc82cdf4000aff13a6c11fffe19096cf45`](https://github.com/withastro/astro/commit/53c69dcc82cdf4000aff13a6c11fffe19096cf45), [`2f81cffa9da9db0e2802d303f94feaee8d2f54ec`](https://github.com/withastro/astro/commit/2f81cffa9da9db0e2802d303f94feaee8d2f54ec), [`a505190933365268d48139a5f197a3cfb5570870`](https://github.com/withastro/astro/commit/a505190933365268d48139a5f197a3cfb5570870)]:
  - @astrojs/markdown-remark@4.2.0

## 2.0.5

### Patch Changes

- [#9706](https://github.com/withastro/astro/pull/9706) [`1539e04a8e5865027b3a8718c6f142885e7c8d88`](https://github.com/withastro/astro/commit/1539e04a8e5865027b3a8718c6f142885e7c8d88) Thanks [@bluwy](https://github.com/bluwy)! - Removes redundant HMR handling code

- Updated dependencies [[`165cfc154be477337037185c32b308616d1ed6fa`](https://github.com/withastro/astro/commit/165cfc154be477337037185c32b308616d1ed6fa), [`e9a72d9a91a3741566866bcaab11172cb0dc7d31`](https://github.com/withastro/astro/commit/e9a72d9a91a3741566866bcaab11172cb0dc7d31)]:
  - @astrojs/markdown-remark@4.1.0

## 2.0.4

### Patch Changes

- [#9652](https://github.com/withastro/astro/pull/9652) [`e72efd6a9a1e2a70488fd225529617ffd8418534`](https://github.com/withastro/astro/commit/e72efd6a9a1e2a70488fd225529617ffd8418534) Thanks [@bluwy](https://github.com/bluwy)! - Removes environment variables workaround that broke project builds with sourcemaps

## 2.0.3

### Patch Changes

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 2.0.2

### Patch Changes

- [#9452](https://github.com/withastro/astro/pull/9452) [`e83b5095f`](https://github.com/withastro/astro/commit/e83b5095f164f48ba40fc715a805fc66a3e39dcf) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Upgrades vite to latest

## 2.0.1

### Patch Changes

- [#9366](https://github.com/withastro/astro/pull/9366) [`1b4e91898`](https://github.com/withastro/astro/commit/1b4e91898116f75b02b66ec402385cf44e559118) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates NPM package to refer to the stable Astro version instead of a beta.

- Updated dependencies [[`270c6cc27`](https://github.com/withastro/astro/commit/270c6cc27f20995883fcdabbff9b56d7f041f9e4)]:
  - @astrojs/markdown-remark@4.0.1

## 2.0.0

### Major Changes

- [#9138](https://github.com/withastro/astro/pull/9138) [`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3) Thanks [@bluwy](https://github.com/bluwy)! - Updates the unified, remark, and rehype dependencies to latest. Make sure to update your custom remark and rehype plugins as well to be compatible with the latest versions.

  **Potentially breaking change:** The default value of `markdown.remarkRehype.footnoteBackLabel` is changed from `"Back to content"` to `"Back to reference 1"`. See the `mdast-util-to-hast` [commit](https://github.com/syntax-tree/mdast-util-to-hast/commit/56c88e45690be138fad9f0bf367b939d09816863) for more information.

### Patch Changes

- Updated dependencies [[`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3), [`addb57c8e`](https://github.com/withastro/astro/commit/addb57c8e80b7b67ec61224666f3a1db5c44410c), [`c7953645e`](https://github.com/withastro/astro/commit/c7953645eeaaf9e87c6db4494b0023d2c1878ff0)]:
  - @astrojs/markdown-remark@4.0.0

## 2.0.0-beta.0

### Major Changes

- [#9138](https://github.com/withastro/astro/pull/9138) [`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3) Thanks [@bluwy](https://github.com/bluwy)! - Updates the unified, remark, and rehype dependencies to latest. Make sure to update your custom remark and rehype plugins as well to be compatible with the latest versions.

  **Potentially breaking change:** The default value of `markdown.remarkRehype.footnoteBackLabel` is changed from `"Back to content"` to `"Back to reference 1"`. See the `mdast-util-to-hast` [commit](https://github.com/syntax-tree/mdast-util-to-hast/commit/56c88e45690be138fad9f0bf367b939d09816863) for more information.

### Patch Changes

- Updated dependencies [[`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3), [`6201bbe96`](https://github.com/withastro/astro/commit/6201bbe96c2a083fb201e4a43a9bd88499821a3e), [`cdabf6ef0`](https://github.com/withastro/astro/commit/cdabf6ef02be7220fd2b6bdcef924ceca089381e), [`addb57c8e`](https://github.com/withastro/astro/commit/addb57c8e80b7b67ec61224666f3a1db5c44410c), [`1c48ed286`](https://github.com/withastro/astro/commit/1c48ed286538ab9e354eca4e4dcd7c6385c96721), [`37697a2c5`](https://github.com/withastro/astro/commit/37697a2c5511572dc29c0a4ea46f90c2f62be8e6), [`bd0c2e9ae`](https://github.com/withastro/astro/commit/bd0c2e9ae3389a9d3085050c1e8134ae98dff299), [`c7953645e`](https://github.com/withastro/astro/commit/c7953645eeaaf9e87c6db4494b0023d2c1878ff0), [`0fe3a7ed5`](https://github.com/withastro/astro/commit/0fe3a7ed5d7bb1a9fce1623e84ba14104b51223c), [`710be505c`](https://github.com/withastro/astro/commit/710be505c9ddf416e77a75343d8cae9c497d72c6), [`153a5abb9`](https://github.com/withastro/astro/commit/153a5abb905042ac68b712514dc9ec387d3e6b17)]:
  - @astrojs/markdown-remark@4.0.0-beta.0
  - astro@4.0.0-beta.0

## 1.1.5

### Patch Changes

- Updated dependencies [[`4537ecf0d`](https://github.com/withastro/astro/commit/4537ecf0d060f89cb8c000338a7fc5f4197a88c8)]:
  - @astrojs/markdown-remark@3.5.0

## 1.1.4

### Patch Changes

- Updated dependencies [[`c5010aad3`](https://github.com/withastro/astro/commit/c5010aad3475669648dc939e00f88bbb52489d0d)]:
  - @astrojs/markdown-remark@3.4.0

## 1.1.3

### Patch Changes

- [#8897](https://github.com/withastro/astro/pull/8897) [`5a3d46da1`](https://github.com/withastro/astro/commit/5a3d46da1e80f62a29eaf464eeb87c626cc5593f) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Update the README to suggest that users install the [official MDX extension](https://marketplace.visualstudio.com/items?itemName=unifiedjs.vscode-mdx) for [VS Code](https://code.visualstudio.com/).

- Updated dependencies [[`26b77b8fe`](https://github.com/withastro/astro/commit/26b77b8fef0e03bfc5550aecaa1f56a4fc1cd297)]:
  - astro@3.3.4

## 1.1.2

### Patch Changes

- Updated dependencies [[`2993055be`](https://github.com/withastro/astro/commit/2993055bed2764c31ff4b4f55b81ab6b1ae6b401), [`c4270e476`](https://github.com/withastro/astro/commit/c4270e47681ee2453f3fea07fed7b238645fd6ea), [`bd5aa1cd3`](https://github.com/withastro/astro/commit/bd5aa1cd35ecbd2784f30dd836ff814684fee02b), [`f369fa250`](https://github.com/withastro/astro/commit/f369fa25055a3497ebaf61c88fb0e8af56c73212), [`391729686`](https://github.com/withastro/astro/commit/391729686bcc8404a7dd48c5987ee380daf3200f), [`f999365b8`](https://github.com/withastro/astro/commit/f999365b8248b8b14f3743e68a42d450d06acff3), [`b2ae9ee0c`](https://github.com/withastro/astro/commit/b2ae9ee0c42b11ffc1d3f070d1d5ac881aef84ed), [`0abff97fe`](https://github.com/withastro/astro/commit/0abff97fed3db14be3c75ff9ece3aab67c4ba783), [`3bef32f81`](https://github.com/withastro/astro/commit/3bef32f81c56bc600ca307f1bd40787e23e625a5)]:
  - astro@3.3.0
  - @astrojs/markdown-remark@3.3.0

## 1.1.1

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

- Updated dependencies [[`21f482657`](https://github.com/withastro/astro/commit/21f4826576c2c812a1604e18717799da3470decd), [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c), [`d78806dfe`](https://github.com/withastro/astro/commit/d78806dfe0301ea7ffe6c7c1f783bd415ac7cda9), [`d1c75fe15`](https://github.com/withastro/astro/commit/d1c75fe158839699c59728cf3a83888e8c72a459), [`aa265d730`](https://github.com/withastro/astro/commit/aa265d73024422967c1b1c68ad268c419c6c798f), [`78adbc443`](https://github.com/withastro/astro/commit/78adbc4433208458291e36713909762e148e1e5d), [`21e0757ea`](https://github.com/withastro/astro/commit/21e0757ea22a57d344c934045ca19db93b684436), [`357270f2a`](https://github.com/withastro/astro/commit/357270f2a3d0bf2aa634ba7e52e9d17618eff4a7)]:
  - @astrojs/markdown-remark@3.2.1
  - astro@3.2.3

## 1.1.0

### Minor Changes

- [#8468](https://github.com/withastro/astro/pull/8468) [`a8d72ceae`](https://github.com/withastro/astro/commit/a8d72ceaeed154434923b21c0ae129a72263b8ed) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support the `img` component export for optimized images. This allows you to customize how optimized images are styled and rendered.

  When rendering an optimized image, Astro will pass the `ImageMetadata` object to your `img` component as the `src` prop. For unoptimized images (i.e. images using URLs or absolute paths), Astro will continue to pass the `src` as a string.

  This example handles both cases and applies custom styling:

  ```astro
  ---
  // src/components/MyImage.astro
  import type { ImageMetadata } from 'astro';
  import { Image } from 'astro:assets';

  type Props = {
    src: string | ImageMetadata;
    alt: string;
  };

  const { src, alt } = Astro.props;
  ---

  {
    typeof src === 'string' ? (
      <img class="custom-styles" src={src} alt={alt} />
    ) : (
      <Image class="custom-styles" {src} {alt} />
    )
  }

  <style>
    .custom-styles {
      border: 1px solid red;
    }
  </style>
  ```

  Now, this components can be applied to the `img` component props object or file export:

  ```md
  import MyImage from '../../components/MyImage.astro';

  export const components = { img: MyImage };

  # My MDX article
  ```

### Patch Changes

- [#8533](https://github.com/withastro/astro/pull/8533) [`74dc3edb3`](https://github.com/withastro/astro/commit/74dc3edb305c49feec49c39082fa836485da8a92) Thanks [@bluwy](https://github.com/bluwy)! - Improve MDX rendering performance by sharing processor instance

- Updated dependencies [[`7522bb491`](https://github.com/withastro/astro/commit/7522bb4914f2f9e8b8f3c743bc9c941fd3aca644), [`ecc65abbf`](https://github.com/withastro/astro/commit/ecc65abbf9e086c5bbd1973cd4a820082b4e0dc5), [`2c4fc878b`](https://github.com/withastro/astro/commit/2c4fc878bece36b7fcf1470419c7ce6f1e1e95d0), [`d93987824`](https://github.com/withastro/astro/commit/d93987824d3d6b4f58267be21ab8466ee8d5d5f8), [`c92e0acd7`](https://github.com/withastro/astro/commit/c92e0acd715171b3f4c3294099780e21576648c8), [`7522bb491`](https://github.com/withastro/astro/commit/7522bb4914f2f9e8b8f3c743bc9c941fd3aca644), [`f95febf96`](https://github.com/withastro/astro/commit/f95febf96bb97babb28d78994332f5e47f5f637d), [`b85c8a78a`](https://github.com/withastro/astro/commit/b85c8a78a116dbbddc901438bc0b7a1917dc0238), [`45364c345`](https://github.com/withastro/astro/commit/45364c345267429e400baecd1fbc290503f8b13a)]:
  - astro@3.1.0
  - @astrojs/markdown-remark@3.2.0

## 1.0.3

### Patch Changes

- [#8430](https://github.com/withastro/astro/pull/8430) [`f3f62a5a2`](https://github.com/withastro/astro/commit/f3f62a5a20f4881bb04f65f192df8e1ccf7fb601) Thanks [@bluwy](https://github.com/bluwy)! - Use exported remarkShiki and remarkPrism plugins from `@astrojs/markdown-remark`

- Updated dependencies [[`f3f62a5a2`](https://github.com/withastro/astro/commit/f3f62a5a20f4881bb04f65f192df8e1ccf7fb601), [`f66053a1e`](https://github.com/withastro/astro/commit/f66053a1ea0a4e3bdb0b0df12bb1bf56e1ea2618), [`0fa483283`](https://github.com/withastro/astro/commit/0fa483283e54c94f173838cd558dc0dbdd11e699)]:
  - @astrojs/markdown-remark@3.1.0
  - astro@3.0.11

## 1.0.2

### Patch Changes

- [#8438](https://github.com/withastro/astro/pull/8438) [`6df4f3bd9`](https://github.com/withastro/astro/commit/6df4f3bd9d74de47dc8732e7f3b42bef42d2facf) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix errors not having a stacktrace

- Updated dependencies [[`b3cf1b327`](https://github.com/withastro/astro/commit/b3cf1b32765c76cfc90e497a68280ad52f02cb1f), [`b92d066b7`](https://github.com/withastro/astro/commit/b92d066b737f64f08a9cf293bd07c9263ef8f32d)]:
  - astro@3.0.10

## 1.0.1

### Patch Changes

- [#8405](https://github.com/withastro/astro/pull/8405) [`93a1231f1`](https://github.com/withastro/astro/commit/93a1231f14d97339e38d8a67cf541337960e7d5e) Thanks [@delucis](https://github.com/delucis)! - Add location data to MDX compile errors

- Updated dependencies [[`7d95bd9ba`](https://github.com/withastro/astro/commit/7d95bd9baaf755239fd7d35e4813861b2dbccf42), [`1947ef7a9`](https://github.com/withastro/astro/commit/1947ef7a99ce3d1d6ea797842edd31d5edffa5de), [`61ad70fdc`](https://github.com/withastro/astro/commit/61ad70fdc52035964c43ecdb4cf7468f6c2b61e7), [`d2f2a11cd`](https://github.com/withastro/astro/commit/d2f2a11cdb42b0de79be21c798eda8e7e7b2a277), [`5126c6a40`](https://github.com/withastro/astro/commit/5126c6a40f88bff66ee5d3c3a21eea8c4a44ce7a), [`48ff7855b`](https://github.com/withastro/astro/commit/48ff7855b238536a3df17cb29335c90029fc41a4), [`923a443cb`](https://github.com/withastro/astro/commit/923a443cb060a0e936a0e1cc87c0360232f77914), [`8935b3b46`](https://github.com/withastro/astro/commit/8935b3b4672d6c54c7b79e6c4575298f75eeb9f4)]:
  - astro@3.0.9

## 1.0.0

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8131](https://github.com/withastro/astro/pull/8131) [`43140b87a`](https://github.com/withastro/astro/commit/43140b87abad99d9e3472faf0e263728ff5a033b) Thanks [@matthewp](https://github.com/matthewp)! - Support Astro 3 JSX format

  This upgrades the MDX plugin to correctly work with the new JSX render API in Astro 3.

### Minor Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8169](https://github.com/withastro/astro/pull/8169) [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12) Thanks [@bluwy](https://github.com/bluwy)! - Remove pre-shiki v0.14 theme names for compatibility. Please rename to the new theme names to migrate:

  - `material-darker` -> `material-theme-darker`
  - `material-default` -> `material-theme`
  - `material-lighter` -> `material-theme-lighter`
  - `material-ocean` -> `material-theme-ocean`
  - `material-palenight` -> `material-theme-palenight`

- [#8188](https://github.com/withastro/astro/pull/8188) [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0) Thanks [@ematipico](https://github.com/ematipico)! - Add `astro` as peer dependency

### Patch Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0) Thanks [@ematipico](https://github.com/ematipico)! - Re-orders the MDX plugin to run before Astro's JSX plugin

- [#8188](https://github.com/withastro/astro/pull/8188) [`32669cd47`](https://github.com/withastro/astro/commit/32669cd47555e9c7433c3998a2b6e624dfb2d8e9) Thanks [@ematipico](https://github.com/ematipico)! - Handle `components` exports handling itself

- Updated dependencies [[`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312), [`db39206cb`](https://github.com/withastro/astro/commit/db39206cbb85b034859ac416179f141184bb2bff), [`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`0c7b42dc6`](https://github.com/withastro/astro/commit/0c7b42dc6780e687e416137539f55a3a427d1d10), [`46c4c0e05`](https://github.com/withastro/astro/commit/46c4c0e053f830585b9ef229ce1c259df00a80f8), [`364d861bd`](https://github.com/withastro/astro/commit/364d861bd527b8511968e2837728148f090bedef), [`2484dc408`](https://github.com/withastro/astro/commit/2484dc4080e5cd84b9a53648a1de426d7c907be2), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`c2c71d90c`](https://github.com/withastro/astro/commit/c2c71d90c264a2524f99e0373ab59015f23ad4b1), [`cd2d7e769`](https://github.com/withastro/astro/commit/cd2d7e76981ef9b9013453aa2629838e1e9fd422), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`e45f30293`](https://github.com/withastro/astro/commit/e45f3029340db718b6ed7e91b5d14f5cf14cd71d), [`c0de7a7b0`](https://github.com/withastro/astro/commit/c0de7a7b0f042cd49cbea4f4ac1b2ab6f9fef644), [`65c354969`](https://github.com/withastro/astro/commit/65c354969e6fe0ef6d622e8f4c545e2f717ce8c6), [`3c3100851`](https://github.com/withastro/astro/commit/3c31008519ce68b5b1b1cb23b71fbe0a2d506882), [`34cb20021`](https://github.com/withastro/astro/commit/34cb2002161ba88df6bcb72fecfd12ed867c134b), [`a824863ab`](https://github.com/withastro/astro/commit/a824863ab1c451f4068eac54f28dd240573e1cba), [`44f7a2872`](https://github.com/withastro/astro/commit/44f7a28728c56c04ac377b6e917329f324874043), [`1048aca55`](https://github.com/withastro/astro/commit/1048aca550769415e528016e42b358ffbfd44b61), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`9e021a91c`](https://github.com/withastro/astro/commit/9e021a91c57d10809f588dd47968fc0e7f8b4d5c), [`7511a4980`](https://github.com/withastro/astro/commit/7511a4980fd36536464c317de33a5190427f430a), [`c37632a20`](https://github.com/withastro/astro/commit/c37632a20d06164fb97a4c2fc48df6d960398832), [`acf652fc1`](https://github.com/withastro/astro/commit/acf652fc1d5db166231e87e22d0d50444f5556d8), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`8450379db`](https://github.com/withastro/astro/commit/8450379db854fb1eaa9f38f21d65db240bc616cd), [`dbc97b121`](https://github.com/withastro/astro/commit/dbc97b121f42583728f1cdfdbf14575fda943f5b), [`7d2f311d4`](https://github.com/withastro/astro/commit/7d2f311d428e3d1c8c13b9bf2a708d6435713fc2), [`2540feedb`](https://github.com/withastro/astro/commit/2540feedb06785d5a20eecc3668849f147d778d4), [`ea7ff5177`](https://github.com/withastro/astro/commit/ea7ff5177dbcd7b2508cb1eef1b22b8ee1f47079), [`68efd4a8b`](https://github.com/withastro/astro/commit/68efd4a8b29f248397667801465b3152dc98e9a7), [`7bd1b86f8`](https://github.com/withastro/astro/commit/7bd1b86f85c06fdde0a1ed9146d01bac69990671), [`036388f66`](https://github.com/withastro/astro/commit/036388f66dab68ad54b895ed86f9176958dd83c8), [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae), [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`a8f35777e`](https://github.com/withastro/astro/commit/a8f35777e7e322068a4e2f520c2c9e43ade19e58), [`70f34f5a3`](https://github.com/withastro/astro/commit/70f34f5a355f42526ee9e5355f3de8e510002ea2), [`5208a3c8f`](https://github.com/withastro/astro/commit/5208a3c8fefcec7694857fb344af351f4631fc34), [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`ffc9e2d3d`](https://github.com/withastro/astro/commit/ffc9e2d3de46049bf3d82140ef018f524fb03187), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`0f637c71e`](https://github.com/withastro/astro/commit/0f637c71e511cb4c51712128d217a26c8eee4d40), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`8a5b0c1f3`](https://github.com/withastro/astro/commit/8a5b0c1f3a4be6bb62db66ec70144109ff5b4c59), [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`632579dc2`](https://github.com/withastro/astro/commit/632579dc2094cc342929261c89e689f0dd358284), [`3674584e0`](https://github.com/withastro/astro/commit/3674584e02b161a698b429ceb66723918fdc56ac), [`1db4e92c1`](https://github.com/withastro/astro/commit/1db4e92c12ed73681217f5cefd39f2f47542f961), [`e7f872e91`](https://github.com/withastro/astro/commit/e7f872e91e852b901cf221a5151077dec64305bf), [`16f09dfff`](https://github.com/withastro/astro/commit/16f09dfff7722fda99dd0412e3006a7a39c80829), [`4477bb41c`](https://github.com/withastro/astro/commit/4477bb41c8ed688785c545731ef5b184b629f4e5), [`55c10d1d5`](https://github.com/withastro/astro/commit/55c10d1d564e805efc3c1a7c48e0d9a1cdf0c7ed), [`3e834293d`](https://github.com/withastro/astro/commit/3e834293d47ab2761a7aa013916e8371871efb7f), [`96beb883a`](https://github.com/withastro/astro/commit/96beb883ad87f8bbf5b2f57e14a743763d2a6f58), [`997a0db8a`](https://github.com/withastro/astro/commit/997a0db8a4e3851edd69384cf5eadbb969e1d547), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`0f0625504`](https://github.com/withastro/astro/commit/0f0625504145f18cba7dc6cf20291cb2abddc5a9), [`e1ae56e72`](https://github.com/withastro/astro/commit/e1ae56e724d0f83db1230359e06cd6bc26f5fa26), [`f32d093a2`](https://github.com/withastro/astro/commit/f32d093a280faafff024228c12bb438156ec34d7), [`f01eb585e`](https://github.com/withastro/astro/commit/f01eb585e7c972d940761309b1595f682b6922d2), [`b76c166bd`](https://github.com/withastro/astro/commit/b76c166bdd8e28683f62806aef968d1e0c3b06d9), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`866ed4098`](https://github.com/withastro/astro/commit/866ed4098edffb052239cdb26e076cf8db61b1d9), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf), [`32669cd47`](https://github.com/withastro/astro/commit/32669cd47555e9c7433c3998a2b6e624dfb2d8e9)]:
  - @astrojs/prism@3.0.0
  - astro@3.0.0
  - @astrojs/markdown-remark@3.0.0

## 1.0.0-rc.2

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Minor Changes

- [#8169](https://github.com/withastro/astro/pull/8169) [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12) Thanks [@bluwy](https://github.com/bluwy)! - Remove pre-shiki v0.14 theme names for compatibility. Please rename to the new theme names to migrate:

  - `material-darker` -> `material-theme-darker`
  - `material-default` -> `material-theme`
  - `material-lighter` -> `material-theme-lighter`
  - `material-ocean` -> `material-theme-ocean`
  - `material-palenight` -> `material-theme-palenight`

### Patch Changes

- Updated dependencies [[`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`582132328`](https://github.com/withastro/astro/commit/5821323285646aee7ff9194a505f708028e4db57), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`95120efbe`](https://github.com/withastro/astro/commit/95120efbe817163663492181cbeb225849354493), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`179796405`](https://github.com/withastro/astro/commit/179796405e053b559d83f84507e5a465861a029a), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf)]:
  - astro@3.0.0-rc.5
  - @astrojs/markdown-remark@3.0.0-rc.1
  - @astrojs/prism@3.0.0-rc.1

## 1.0.0-beta.1

### Major Changes

- [#8131](https://github.com/withastro/astro/pull/8131) [`43140b87a`](https://github.com/withastro/astro/commit/43140b87abad99d9e3472faf0e263728ff5a033b) Thanks [@matthewp](https://github.com/matthewp)! - Support Astro 3 JSX format

  This upgrades the MDX plugin to correctly work with the new JSX render API in Astro 3.

### Patch Changes

- Updated dependencies [[`2484dc408`](https://github.com/withastro/astro/commit/2484dc4080e5cd84b9a53648a1de426d7c907be2), [`c2c71d90c`](https://github.com/withastro/astro/commit/c2c71d90c264a2524f99e0373ab59015f23ad4b1), [`7177f7579`](https://github.com/withastro/astro/commit/7177f7579b6e866f0fd895b3fd079d8ba330b1a9), [`097a8e4e9`](https://github.com/withastro/astro/commit/097a8e4e916c7df18eafdaa6c8d6ce2991c17ab6), [`dbc97b121`](https://github.com/withastro/astro/commit/dbc97b121f42583728f1cdfdbf14575fda943f5b), [`2540feedb`](https://github.com/withastro/astro/commit/2540feedb06785d5a20eecc3668849f147d778d4), [`ea7ff5177`](https://github.com/withastro/astro/commit/ea7ff5177dbcd7b2508cb1eef1b22b8ee1f47079), [`68efd4a8b`](https://github.com/withastro/astro/commit/68efd4a8b29f248397667801465b3152dc98e9a7), [`0e0fa605d`](https://github.com/withastro/astro/commit/0e0fa605d109cc91e08a1ae1cc560ea240fe631b), [`5208a3c8f`](https://github.com/withastro/astro/commit/5208a3c8fefcec7694857fb344af351f4631fc34), [`8a5b0c1f3`](https://github.com/withastro/astro/commit/8a5b0c1f3a4be6bb62db66ec70144109ff5b4c59), [`d6b494376`](https://github.com/withastro/astro/commit/d6b4943764989c0e89df2d6875cd19691566dfb3), [`4477bb41c`](https://github.com/withastro/astro/commit/4477bb41c8ed688785c545731ef5b184b629f4e5), [`3e834293d`](https://github.com/withastro/astro/commit/3e834293d47ab2761a7aa013916e8371871efb7f), [`b76c166bd`](https://github.com/withastro/astro/commit/b76c166bdd8e28683f62806aef968d1e0c3b06d9)]:
  - astro@3.0.0-beta.3

## 1.0.0-beta.0

### Minor Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8) Thanks [@bluwy](https://github.com/bluwy)! - Add `astro` as peer dependency

### Patch Changes

- [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8) Thanks [@bluwy](https://github.com/bluwy)! - Re-orders the MDX plugin to run before Astro's JSX plugin

- [`631b9c410`](https://github.com/withastro/astro/commit/631b9c410d5d66fa384674027ba95d69ebb5063f) Thanks [@bluwy](https://github.com/bluwy)! - Handle `components` exports handling itself

- Updated dependencies [[`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81), [`76ddef19c`](https://github.com/withastro/astro/commit/76ddef19ccab6e5f7d3a5740cd41acf10e334b38), [`9b4f70a62`](https://github.com/withastro/astro/commit/9b4f70a629f55e461759ba46f68af7097a2e9215), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`2f951cd40`](https://github.com/withastro/astro/commit/2f951cd403dfcc2c3ca6aae618ae3e1409516e32), [`c022a4217`](https://github.com/withastro/astro/commit/c022a4217a805d223c1494e9eda4e48bbf810388), [`67becaa58`](https://github.com/withastro/astro/commit/67becaa580b8f787df58de66b7008b7098f1209c), [`bc37331d8`](https://github.com/withastro/astro/commit/bc37331d8154e3e95a8df9131e4e014e78a7a9e7), [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8), [`3dc1ca2fa`](https://github.com/withastro/astro/commit/3dc1ca2fac8d9965cc5085a5d09e72ed87b4281a), [`1be84dfee`](https://github.com/withastro/astro/commit/1be84dfee3ce8e6f5cc624f99aec4e980f6fde37), [`35f01df79`](https://github.com/withastro/astro/commit/35f01df797d23315f2bee2fc3fd795adb0559c58), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`78de801f2`](https://github.com/withastro/astro/commit/78de801f21fd4ca1653950027d953bf08614566b), [`59d6e569f`](https://github.com/withastro/astro/commit/59d6e569f63e175c97e82e94aa7974febfb76f7c), [`7723c4cc9`](https://github.com/withastro/astro/commit/7723c4cc93298c2e6530e55da7afda048f22cf81), [`fb5cd6b56`](https://github.com/withastro/astro/commit/fb5cd6b56dc27a71366ed5e1ab8bfe9b8f96bac5), [`631b9c410`](https://github.com/withastro/astro/commit/631b9c410d5d66fa384674027ba95d69ebb5063f)]:
  - @astrojs/prism@3.0.0-beta.0
  - astro@3.0.0-beta.0
  - @astrojs/markdown-remark@3.0.0-beta.0

## 0.19.7

### Patch Changes

- [#7307](https://github.com/withastro/astro/pull/7307) [`8034edd9e`](https://github.com/withastro/astro/commit/8034edd9ecf805073395ba7f68f73cd5fc4d2c73) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix [Object AsyncGenerator] appearing in markup for Markdoc documents

## 0.19.6

### Patch Changes

- [#7185](https://github.com/withastro/astro/pull/7185) [`339529fc8`](https://github.com/withastro/astro/commit/339529fc820bac2d514b63198ecf54a1d88c0917) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Bring back improved style and script handling across content collection files. This addresses bugs found in a previous release to `@astrojs/markdoc`.

## 0.19.5

### Patch Changes

- [#7151](https://github.com/withastro/astro/pull/7151) [`ea16570b1`](https://github.com/withastro/astro/commit/ea16570b1e0929678170c10b06c011dc668d7013) Thanks [@bluwy](https://github.com/bluwy)! - Add `optimize` option for faster builds and rendering

- [#7192](https://github.com/withastro/astro/pull/7192) [`7851f9258`](https://github.com/withastro/astro/commit/7851f9258fae2f54795470253df9ce4bcd5f9cb0) Thanks [@ematipico](https://github.com/ematipico)! - Detect `mdx` files using their full extension

- [#7191](https://github.com/withastro/astro/pull/7191) [`27c6e0182`](https://github.com/withastro/astro/commit/27c6e01826a6da525f1f811d97784accd1ebbd96) Thanks [@bluwy](https://github.com/bluwy)! - Remove `@mdx-js/rollup` dependency

## 0.19.4

### Patch Changes

- [#7178](https://github.com/withastro/astro/pull/7178) [`57e65d247`](https://github.com/withastro/astro/commit/57e65d247f67de61bcc3a585c2254feb61ed2e74) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: revert Markdoc asset bleed changes. Production build issues were discovered that deserve a different fix.

## 0.19.3

### Patch Changes

- [#6758](https://github.com/withastro/astro/pull/6758) [`f558a9e20`](https://github.com/withastro/astro/commit/f558a9e2056fc8f2e2d5814e74f199e398159fc4) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Improve style and script handling across content collection files. This addresses style bleed present in `@astrojs/markdoc` v0.1.0

## 0.19.2

### Patch Changes

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

- Updated dependencies [[`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa)]:
  - @astrojs/markdown-remark@2.2.1
  - @astrojs/prism@2.1.2

## 0.19.1

### Patch Changes

- [#6932](https://github.com/withastro/astro/pull/6932) [`49514e4ce`](https://github.com/withastro/astro/commit/49514e4ce40fedb39bf7decd2c296258efbdafc7) Thanks [@bluwy](https://github.com/bluwy)! - Upgrade shiki to v0.14.1. This updates the shiki theme colors and adds the theme name to the `pre` tag, e.g. `<pre class="astro-code github-dark">`.

- Updated dependencies [[`49514e4ce`](https://github.com/withastro/astro/commit/49514e4ce40fedb39bf7decd2c296258efbdafc7)]:
  - @astrojs/markdown-remark@2.2.0

## 0.19.0

### Minor Changes

- [#6824](https://github.com/withastro/astro/pull/6824) [`2511d58d5`](https://github.com/withastro/astro/commit/2511d58d586af080a78e5ef8a63020b3e17770db) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add support for using optimized and relative images in MDX files with `experimental.assets`

### Patch Changes

- Updated dependencies [[`2511d58d5`](https://github.com/withastro/astro/commit/2511d58d586af080a78e5ef8a63020b3e17770db)]:
  - @astrojs/markdown-remark@2.1.4

## 0.18.4

### Patch Changes

- [#6817](https://github.com/withastro/astro/pull/6817) [`f882bc163`](https://github.com/withastro/astro/commit/f882bc1636d5ce1c3b8faae47df36b4dc758045a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix sourcemap warnings when using Content Collections and MDX with the `vite.build.sourcemap` option

## 0.18.3

### Patch Changes

- [#6779](https://github.com/withastro/astro/pull/6779) [`a98f6f418`](https://github.com/withastro/astro/commit/a98f6f418c92261a06ef79624a8c86e288c21eab) Thanks [@matthewp](https://github.com/matthewp)! - Prevent body head content injection in MDX when using layout

## 0.18.2

### Patch Changes

- [#6552](https://github.com/withastro/astro/pull/6552) [`392ba3e4d`](https://github.com/withastro/astro/commit/392ba3e4d55f73ce9194bd94a2243f1aa62af079) Thanks [@bluwy](https://github.com/bluwy)! - Fix integration return type

- Updated dependencies [[`90e5f87d0`](https://github.com/withastro/astro/commit/90e5f87d03215a833bb6ac91f9548670a25ce659), [`f5fddafc2`](https://github.com/withastro/astro/commit/f5fddafc248bb1ef57b7349bfecc25539ae2b5ea)]:
  - @astrojs/markdown-remark@2.1.1

## 0.18.1

### Patch Changes

- [#6494](https://github.com/withastro/astro/pull/6494) [`a13e9d7e3`](https://github.com/withastro/astro/commit/a13e9d7e33baccf51e7d4815f99b481ad174bc57) Thanks [@Yan-Thomas](https://github.com/Yan-Thomas)! - Consistency improvements to several package descriptions

- Updated dependencies [[`a13e9d7e3`](https://github.com/withastro/astro/commit/a13e9d7e33baccf51e7d4815f99b481ad174bc57)]:
  - @astrojs/prism@2.1.1

## 0.18.0

### Minor Changes

- [#6344](https://github.com/withastro/astro/pull/6344) [`694918a56`](https://github.com/withastro/astro/commit/694918a56b01104831296be0c25456135a63c784) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add a new experimental flag (`experimental.assets`) to enable our new core Assets story.

  This unlocks a few features:

  - A new built-in image component and JavaScript API to transform and optimize images.
  - Relative images with automatic optimization in Markdown.
  - Support for validating assets using content collections.
  - and more!

  See [Assets (Experimental)](https://docs.astro.build/en/guides/assets/) on our docs site for more information on how to use this feature!

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

### Patch Changes

- [#6209](https://github.com/withastro/astro/pull/6209) [`fec583909`](https://github.com/withastro/astro/commit/fec583909ab62829dc0c1600e2387979365f2b94) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce the (experimental) `@astrojs/markdoc` integration. This unlocks Markdoc inside your Content Collections, bringing support for Astro and UI components in your content. This also improves Astro core internals to make Content Collections extensible to more file types in the future.

  You can install this integration using the `astro add` command:

  ```
  astro add markdoc
  ```

  [Read the `@astrojs/markdoc` documentation](https://docs.astro.build/en/guides/integrations-guide/markdoc/) for usage instructions, and browse the [new `with-markdoc` starter](https://astro.new/with-markdoc) to try for yourself.

- Updated dependencies [[`694918a56`](https://github.com/withastro/astro/commit/694918a56b01104831296be0c25456135a63c784), [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808)]:
  - @astrojs/markdown-remark@2.1.0
  - @astrojs/prism@2.1.0

## 0.17.2

### Patch Changes

- [#6296](https://github.com/withastro/astro/pull/6296) [`075b87e8b`](https://github.com/withastro/astro/commit/075b87e8b72a69a608cd2ff1196dc0989e2cf1e1) Thanks [@RaphaelBossek](https://github.com/RaphaelBossek)! - Update to `es-module-lexer@1.1.1`

## 0.17.1

- Updated to es-module-lexer@1.1.1

## 0.17.0

### Minor Changes

- [#6253](https://github.com/withastro/astro/pull/6253) [`0049fda62`](https://github.com/withastro/astro/commit/0049fda62fa8650a0d250adb00a2c5d82679aeaf) Thanks [@bluwy](https://github.com/bluwy)! - Support rehype plugins that inject namespaced attributes. This introduces a breaking change if you use [custom components for HTML elements](https://docs.astro.build/en/guides/markdown-content/#assigning-custom-components-to-html-elements), where the prop passed to the component will be normal HTML casing, e.g. `class` instead of `className`, and `xlink:href` instead of `xlinkHref`.

## 0.16.2

### Patch Changes

- [#6252](https://github.com/withastro/astro/pull/6252) [`0fbcf838a`](https://github.com/withastro/astro/commit/0fbcf838a775d3b07e7c2372888a8aa6c190278e) Thanks [@bluwy](https://github.com/bluwy)! - Revert previous breaking change

## 0.16.1

### Patch Changes

- [#6243](https://github.com/withastro/astro/pull/6243) [`4f6ecba4c`](https://github.com/withastro/astro/commit/4f6ecba4c1b35bacbbc0097854ee2b7b8c878e71) Thanks [@bluwy](https://github.com/bluwy)! - Support rehype plugins that inject namespaced attributes

## 0.16.0

### Minor Changes

- [#6050](https://github.com/withastro/astro/pull/6050) [`2ab32b59e`](https://github.com/withastro/astro/commit/2ab32b59ef0a28d34757f2c2adb9cf2baa86855e) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: load syntax highlighters after MDX remark plugins. This keeps MDX consistent with Astro's markdown behavior.

### Patch Changes

- [#6062](https://github.com/withastro/astro/pull/6062) [`c6cf847bd`](https://github.com/withastro/astro/commit/c6cf847bd0b6bef3c51a5710fba5ca43b11e46f9) Thanks [@delucis](https://github.com/delucis)! - Update MDX README

## 0.15.2

### Patch Changes

- [#5478](https://github.com/withastro/astro/pull/5478) [`1c7eef308`](https://github.com/withastro/astro/commit/1c7eef308e808aa5ed4662b53e67ec8d1b814d1f) Thanks [@nemo0](https://github.com/nemo0)! - Update READMEs for consistency

## 0.15.1

### Patch Changes

- [#5978](https://github.com/withastro/astro/pull/5978) [`7abb1e905`](https://github.com/withastro/astro/commit/7abb1e9056c4b4fd0abfced347df32a41cdfbf28) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fix MDX heading IDs generation when using a frontmatter reference

- Updated dependencies [[`7abb1e905`](https://github.com/withastro/astro/commit/7abb1e9056c4b4fd0abfced347df32a41cdfbf28)]:
  - @astrojs/markdown-remark@2.0.1

## 0.15.0

### Minor Changes

- [#5684](https://github.com/withastro/astro/pull/5684) [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Refine Markdown and MDX configuration options for ease-of-use. & [#5769](https://github.com/withastro/astro/pull/5769) [`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce a `smartypants` flag to opt-out of Astro's default SmartyPants plugin.

  - **Markdown**

    - **Replace the `extendDefaultPlugins` option** with a `gfm` boolean and a `smartypants` boolean. These are enabled by default, and can be disabled to remove GitHub-Flavored Markdown and SmartyPants.

    - Ensure GitHub-Flavored Markdown and SmartyPants are applied whether or not custom `remarkPlugins` or `rehypePlugins` are configured. If you want to apply custom plugins _and_ remove Astro's default plugins, manually set `gfm: false` and `smartypants: false` in your config.

  - **Migrate `extendDefaultPlugins` to `gfm` and `smartypants`**

    You may have disabled Astro's built-in plugins (GitHub-Flavored Markdown and Smartypants) with the `extendDefaultPlugins` option. This has now been split into 2 flags to disable each plugin individually:

    - `markdown.gfm` to disable GitHub-Flavored Markdown
    - `markdown.smartypants` to disable SmartyPants

    ```diff
    // astro.config.mjs
    import { defineConfig } from 'astro/config';

    export default defineConfig({
      markdown: {
    -   extendDefaultPlugins: false,
    +   smartypants: false,
    +   gfm: false,
      }
    });
    ```

    Additionally, applying remark and rehype plugins **no longer disables** `gfm` and `smartypants`. You will need to opt-out manually by setting `gfm` and `smartypants` to `false`.

  - **MDX**

    - Support _all_ Markdown configuration options (except `drafts`) from your MDX integration config. This includes `syntaxHighlighting` and `shikiConfig` options to further customize the MDX renderer.

    - Simplify `extendPlugins` to an `extendMarkdownConfig` option. MDX options will default to their equivalent in your Markdown config. By setting `extendMarkdownConfig` to false, you can "eject" to set your own syntax highlighting, plugins, and more.

  - **Migrate MDX's `extendPlugins` to `extendMarkdownConfig`**

    You may have used the `extendPlugins` option to manage plugin defaults in MDX. This has been replaced by 3 flags:

    - `extendMarkdownConfig` (`true` by default) to toggle Markdown config inheritance. This replaces the `extendPlugins: 'markdown'` option.
    - `gfm` (`true` by default) and `smartypants` (`true` by default) to toggle GitHub-Flavored Markdown and SmartyPants in MDX. This replaces the `extendPlugins: 'defaults'` option.

- [#5687](https://github.com/withastro/astro/pull/5687) [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Give remark and rehype plugins access to user frontmatter via frontmatter injection. This means `data.astro.frontmatter` is now the _complete_ Markdown or MDX document's frontmatter, rather than an empty object.

  This allows plugin authors to modify existing frontmatter, or compute new properties based on other properties. For example, say you want to compute a full image URL based on an `imageSrc` slug in your document frontmatter:

  ```ts
  export function remarkInjectSocialImagePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
      frontmatter.socialImageSrc = new URL(frontmatter.imageSrc, 'https://my-blog.com/').pathname;
    };
  }
  ```

  When using Content Collections, you can access this modified frontmatter using the `remarkPluginFrontmatter` property returned when rendering an entry.

  **Migration instructions**

  Plugin authors should now **check for user frontmatter when applying defaults.**

  For example, say a remark plugin wants to apply a default `title` if none is present. Add a conditional to check if the property is present, and update if none exists:

  ```diff
  export function remarkInjectTitlePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
  +    if (!frontmatter.title) {
        frontmatter.title = 'Default title';
  +    }
    }
  }
  ```

  This differs from previous behavior, where a Markdown file's frontmatter would _always_ override frontmatter injected via remark or reype.

- [#5891](https://github.com/withastro/astro/pull/5891) [`05caf445d`](https://github.com/withastro/astro/commit/05caf445d4d2728f1010aeb2179a9e756c2fd17d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Remove deprecated Markdown APIs from Astro v0.X. This includes `getHeaders()`, the `.astro` property for layouts, and the `rawContent()` and `compiledContent()` error messages for MDX.

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

- [#5825](https://github.com/withastro/astro/pull/5825) [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Baseline the experimental `contentCollections` flag. You're free to remove this from your astro config!

  ```diff
  import { defineConfig } from 'astro/config';

  export default defineConfig({
  - experimental: { contentCollections: true }
  })
  ```

### Patch Changes

- [#5837](https://github.com/withastro/astro/pull/5837) [`12f65a4d5`](https://github.com/withastro/astro/commit/12f65a4d55e3fd2993c2f67b18794dd536280c69) Thanks [@giuseppelt](https://github.com/giuseppelt)! - fix shiki css class replace logic

- [#5741](https://github.com/withastro/astro/pull/5741) [`000d3e694`](https://github.com/withastro/astro/commit/000d3e6940839c2aebba1984e6fb3b133cec6749) Thanks [@delucis](https://github.com/delucis)! - Fix broken links in README

- Updated dependencies [[`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b), [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`12f65a4d5`](https://github.com/withastro/astro/commit/12f65a4d55e3fd2993c2f67b18794dd536280c69), [`16107b6a1`](https://github.com/withastro/astro/commit/16107b6a10514ef1b563e585ec9add4b14f42b94), [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53)]:
  - @astrojs/markdown-remark@2.0.0
  - @astrojs/prism@2.0.0

## 1.0.0-beta.2

<details>
<summary>See changes in 1.0.0-beta.2</summary>

### Major Changes

- [#5825](https://github.com/withastro/astro/pull/5825) [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Baseline the experimental `contentCollections` flag. You're free to remove this from your astro config!

  ```diff
  import { defineConfig } from 'astro/config';

  export default defineConfig({
  - experimental: { contentCollections: true }
  })
  ```

### Minor Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

### Patch Changes

- [#5837](https://github.com/withastro/astro/pull/5837) [`12f65a4d5`](https://github.com/withastro/astro/commit/12f65a4d55e3fd2993c2f67b18794dd536280c69) Thanks [@giuseppelt](https://github.com/giuseppelt)! - fix shiki css class replace logic

- Updated dependencies [[`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`12f65a4d5`](https://github.com/withastro/astro/commit/12f65a4d55e3fd2993c2f67b18794dd536280c69), [`16107b6a1`](https://github.com/withastro/astro/commit/16107b6a10514ef1b563e585ec9add4b14f42b94), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53)]:
  - @astrojs/prism@2.0.0-beta.0
  - @astrojs/markdown-remark@2.0.0-beta.2

</details>

## 0.15.0-beta.1

<details>
<summary>See changes in 0.15.0-beta.1</summary>

### Minor Changes

- [#5769](https://github.com/withastro/astro/pull/5769) [`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce a `smartypants` flag to opt-out of Astro's default SmartyPants plugin.

  ```js
  {
    markdown: {
      smartypants: false,
    }
  }
  ```

  #### Migration

  You may have disabled Astro's built-in plugins (GitHub-Flavored Markdown and Smartypants) with the `extendDefaultPlugins` option. This has now been split into 2 flags to disable each plugin individually:

  - `markdown.gfm` to disable GitHub-Flavored Markdown
  - `markdown.smartypants` to disable SmartyPants

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    markdown: {
  -   extendDefaultPlugins: false,
  +   smartypants: false,
  +   gfm: false,
    }
  });
  ```

### Patch Changes

- [#5741](https://github.com/withastro/astro/pull/5741) [`000d3e694`](https://github.com/withastro/astro/commit/000d3e6940839c2aebba1984e6fb3b133cec6749) Thanks [@delucis](https://github.com/delucis)! - Fix broken links in README

- Updated dependencies [[`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b)]:
  - @astrojs/markdown-remark@2.0.0-beta.1

</details>

## 0.15.0-beta.0

<details>
<summary>See changes in 0.15.0-beta.0</summary>

### Minor Changes

- [#5687](https://github.com/withastro/astro/pull/5687) [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Give remark and rehype plugins access to user frontmatter via frontmatter injection. This means `data.astro.frontmatter` is now the _complete_ Markdown or MDX document's frontmatter, rather than an empty object.

  This allows plugin authors to modify existing frontmatter, or compute new properties based on other properties. For example, say you want to compute a full image URL based on an `imageSrc` slug in your document frontmatter:

  ```ts
  export function remarkInjectSocialImagePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
      frontmatter.socialImageSrc = new URL(frontmatter.imageSrc, 'https://my-blog.com/').pathname;
    };
  }
  ```

  #### Content Collections - new `remarkPluginFrontmatter` property

  We have changed _inject_ frontmatter to _modify_ frontmatter in our docs to improve discoverability. This is based on support forum feedback, where "injection" is rarely the term used.

  To reflect this, the `injectedFrontmatter` property has been renamed to `remarkPluginFrontmatter`. This should clarify this plugin is still separate from the `data` export Content Collections expose today.

  #### Migration instructions

  Plugin authors should now **check for user frontmatter when applying defaults.**

  For example, say a remark plugin wants to apply a default `title` if none is present. Add a conditional to check if the property is present, and update if none exists:

  ```diff
  export function remarkInjectTitlePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
  +    if (!frontmatter.title) {
        frontmatter.title = 'Default title';
  +    }
    }
  }
  ```

  This differs from previous behavior, where a Markdown file's frontmatter would _always_ override frontmatter injected via remark or reype.

- [#5684](https://github.com/withastro/astro/pull/5684) [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Refine Markdown and MDX configuration options for ease-of-use.

  #### Markdown

  - **Remove `remark-smartypants`** from Astro's default Markdown plugins.
  - **Replace the `extendDefaultPlugins` option** with a simplified `gfm` boolean. This is enabled by default, and can be disabled to remove GitHub-Flavored Markdown.
  - Ensure GitHub-Flavored Markdown is applied whether or not custom `remarkPlugins` or `rehypePlugins` are configured. If you want to apply custom plugins _and_ remove GFM, manually set `gfm: false` in your config.

  #### MDX

  - Support _all_ Markdown configuration options (except `drafts`) from your MDX integration config. This includes `syntaxHighlighting` and `shikiConfig` options to further customize the MDX renderer.
  - Simplify `extendDefaults` to an `extendMarkdownConfig` option. MDX options will default to their equivalent in your Markdown config. By setting `extendMarkdownConfig` to false, you can "eject" to set your own syntax highlighting, plugins, and more.

  #### Migration

  To preserve your existing Markdown and MDX setup, you may need some configuration changes:

  ##### Smartypants manual installation

  [Smartypants](https://github.com/silvenon/remark-smartypants) has been removed from Astro's default setup. If you rely on this plugin, [install `remark-smartypants`](https://github.com/silvenon/remark-smartypants#installing) and apply to your `astro.config.*`:

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  + import smartypants from 'remark-smartypants';

  export default defineConfig({
    markdown: {
  +   remarkPlugins: [smartypants],
    }
  });
  ```

  ##### Migrate `extendDefaultPlugins` to `gfm`

  You may have disabled Astro's built-in plugins (GitHub-Flavored Markdown and Smartypants) with the `extendDefaultPlugins` option. Since Smartypants has been removed, this has been renamed to `gfm`.

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    markdown: {
  -   extendDefaultPlugins: false,
  +   gfm: false,
    }
  });
  ```

  Additionally, applying remark and rehype plugins **no longer disables** `gfm`. You will need to opt-out manually by setting `gfm` to `false`.

  ##### Migrate MDX's `extendPlugins` to `extendMarkdownConfig`

  You may have used the `extendPlugins` option to manage plugin defaults in MDX. This has been replaced by 2 flags:

  - `extendMarkdownConfig` (`true` by default) to toggle Markdown config inheritance. This replaces the `extendPlugins: 'markdown'` option.
  - `gfm` (`true` by default) to toggle GitHub-Flavored Markdown in MDX. This replaces the `extendPlugins: 'defaults'` option.

### Patch Changes

- Updated dependencies [[`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144), [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d)]:
  - @astrojs/markdown-remark@2.0.0-beta.0

</details>

## 0.14.0

### Minor Changes

- [#5654](https://github.com/withastro/astro/pull/5654) [`2c65b433b`](https://github.com/withastro/astro/commit/2c65b433bf840a1bb93b0a1947df5949e33512ff) Thanks [@delucis](https://github.com/delucis)! - Run heading ID injection after user plugins

  ⚠️ BREAKING CHANGE ⚠️

  If you are using a rehype plugin that depends on heading IDs injected by Astro, the IDs will no longer be available when your plugin runs by default.

  To inject IDs before your plugins run, import and add the `rehypeHeadingIds` plugin to your `rehypePlugins` config:

  ```diff
  // astro.config.mjs
  + import { rehypeHeadingIds } from '@astrojs/markdown-remark';
  import mdx from '@astrojs/mdx';

  export default {
    integrations: [mdx()],
    markdown: {
      rehypePlugins: [
  +     rehypeHeadingIds,
        otherPluginThatReliesOnHeadingIDs,
      ],
    },
  }
  ```

### Patch Changes

- [#5667](https://github.com/withastro/astro/pull/5667) [`a5ba4af79`](https://github.com/withastro/astro/commit/a5ba4af79930145f4edf66d45cd40ddad045cc86) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Chore: remove verbose "Now inheriting Markdown plugins..." logs

- [#5648](https://github.com/withastro/astro/pull/5648) [`853081d1c`](https://github.com/withastro/astro/commit/853081d1c857d8ad8a9634c37ed8fd123d32d241) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Prevent relative image paths in `src/content/`

- Updated dependencies [[`853081d1c`](https://github.com/withastro/astro/commit/853081d1c857d8ad8a9634c37ed8fd123d32d241), [`2c65b433b`](https://github.com/withastro/astro/commit/2c65b433bf840a1bb93b0a1947df5949e33512ff)]:
  - @astrojs/markdown-remark@1.2.0

## 0.13.0

### Minor Changes

- [#5291](https://github.com/withastro/astro/pull/5291) [`5ec0f6ed5`](https://github.com/withastro/astro/commit/5ec0f6ed55b0a14a9663a90a03428345baf126bd) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce Content Collections experimental API
  - Organize your Markdown and MDX content into easy-to-manage collections.
  - Add type safety to your frontmatter with schemas.
  - Generate landing pages, static routes, and SSR endpoints from your content using the collection query APIs.

## 0.12.2

### Patch Changes

- [#5586](https://github.com/withastro/astro/pull/5586) [`f4ff69a3c`](https://github.com/withastro/astro/commit/f4ff69a3cd874c8804c6d01c7cbbaed8a8e90be7) Thanks [@delucis](https://github.com/delucis)! - Fix link in MDX integration README

- [#5570](https://github.com/withastro/astro/pull/5570) [`3f811eb68`](https://github.com/withastro/astro/commit/3f811eb682d55bd1f908f9b4bc3b795d2859d713) Thanks [@sarah11918](https://github.com/sarah11918)! - Revise README

## 0.12.1

### Patch Changes

- [#5522](https://github.com/withastro/astro/pull/5522) [`efc4363e0`](https://github.com/withastro/astro/commit/efc4363e0baf7f92900e20af339811bb3df42b0e) Thanks [@delucis](https://github.com/delucis)! - Support use of `<Fragment>` in MDX files rendered with `<Content />` component

## 0.12.0

### Minor Changes

- [#5427](https://github.com/withastro/astro/pull/5427) [`2a1c085b1`](https://github.com/withastro/astro/commit/2a1c085b199f24e34424ec8c19041c03602c53c5) Thanks [@backflip](https://github.com/backflip)! - Uses remark-rehype options from astro.config.mjs

### Patch Changes

- [#5448](https://github.com/withastro/astro/pull/5448) [`ef2ffc7ae`](https://github.com/withastro/astro/commit/ef2ffc7ae9ff554860238ecd2fb3bf6d82b5801b) Thanks [@delucis](https://github.com/delucis)! - Fix broken link in README

## 0.11.6

### Patch Changes

- [#5335](https://github.com/withastro/astro/pull/5335) [`dca762cf7`](https://github.com/withastro/astro/commit/dca762cf734a657d8f126fd6958892b6163a4f67) Thanks [@bluwy](https://github.com/bluwy)! - Preserve code element node `data.meta` in `properties.metastring` for rehype syntax highlighters, like `rehype-pretty-code``

## 0.11.5

### Patch Changes

- [#5146](https://github.com/withastro/astro/pull/5146) [`308e565ad`](https://github.com/withastro/astro/commit/308e565ad39957e3353d72ca5d3bbce1a1b45008) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support recmaPlugins config option

## 0.11.4

### Patch Changes

- [#4953](https://github.com/withastro/astro/pull/4953) [`a59731995`](https://github.com/withastro/astro/commit/a59731995b93ae69c21dc3adc5c8b482b466d12e) Thanks [@bluwy](https://github.com/bluwy)! - Log markdown hints with console.info

## 0.11.3

### Patch Changes

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Add missing dependencies, support strict dependency installation (e.g. pnpm)

## 0.11.2

### Patch Changes

- [#4700](https://github.com/withastro/astro/pull/4700) [`e5f71142e`](https://github.com/withastro/astro/commit/e5f71142eb62bd72456e889dad5774347c3753f2) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Document MDXLayoutProps utility type

- [#4858](https://github.com/withastro/astro/pull/4858) [`58a2dca22`](https://github.com/withastro/astro/commit/58a2dca2286cb14f6211cf51267c02447e78433a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Correctly parse import.meta.env in MDX files

## 0.11.1

### Patch Changes

- [#4588](https://github.com/withastro/astro/pull/4588) [`db38f61b2`](https://github.com/withastro/astro/commit/db38f61b2b2dc55f03b28797d19b163b1940f1c8) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: Add GFM and Smartypants to MDX by default

## 0.11.0

### Minor Changes

- [#4504](https://github.com/withastro/astro/pull/4504) [`8f8dff4d3`](https://github.com/withastro/astro/commit/8f8dff4d339a3a12ee155d81a97132032ef3b622) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce new `extendPlugins` configuration option. This defaults to inheriting all remark and rehype plugins from your `markdown` config, with options to use either Astro's defaults or no inheritance at all.

## 0.10.3

### Patch Changes

- [#4519](https://github.com/withastro/astro/pull/4519) [`a2e8e76c3`](https://github.com/withastro/astro/commit/a2e8e76c303e8d6f39c24c122905a10f06907997) Thanks [@JuanM04](https://github.com/JuanM04)! - Upgraded Shiki to v0.11.1

- [#4530](https://github.com/withastro/astro/pull/4530) [`8504cd79b`](https://github.com/withastro/astro/commit/8504cd79b708e0d3bf1a2bb4ff9b86936bdd692b) Thanks [@kylebutts](https://github.com/kylebutts)! - Add custom components to README

## 0.10.2

### Patch Changes

- [#4423](https://github.com/withastro/astro/pull/4423) [`d4cd7a59f`](https://github.com/withastro/astro/commit/d4cd7a59fd38d411c442a818cfaab40f74106628) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update Markdown type signature to match new markdown plugin,and update top-level layout props for better alignment

## 0.10.2-next.0

### Patch Changes

- [#4423](https://github.com/withastro/astro/pull/4423) [`d4cd7a59f`](https://github.com/withastro/astro/commit/d4cd7a59fd38d411c442a818cfaab40f74106628) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update Markdown type signature to match new markdown plugin,and update top-level layout props for better alignment

## 0.10.1

### Patch Changes

- [#4443](https://github.com/withastro/astro/pull/4443) [`adb207979`](https://github.com/withastro/astro/commit/adb20797962c280d4d38f335f577fd52a1b48d4b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix MDX style imports when layout is not applied

* [#4428](https://github.com/withastro/astro/pull/4428) [`a2414bf59`](https://github.com/withastro/astro/commit/a2414bf59e2e2cd633aece68e724401c4ad281b9) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix dev server reload performance when globbing from an MDX layout

## 0.10.0

### Minor Changes

- [#4292](https://github.com/withastro/astro/pull/4292) [`f1a52c18a`](https://github.com/withastro/astro/commit/f1a52c18afe66e6d310743ae6884be76f69be265) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Switch from Shiki Twoslash to Astro's Shiki Markdown highlighter

## 0.9.0

### Minor Changes

- [#4268](https://github.com/withastro/astro/pull/4268) [`f7afdb889`](https://github.com/withastro/astro/commit/f7afdb889fe4e97177958c8ec92f80c5f6e5cb51) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Align MD with MDX on layout props and "glob" import results:
  - Add `Content` to MDX
  - Add `file` and `url` to MDX frontmatter (layout import only)
  - Update glob types to reflect differences (lack of `rawContent` and `compiledContent`)

### Patch Changes

- [#4272](https://github.com/withastro/astro/pull/4272) [`24d2f7a6e`](https://github.com/withastro/astro/commit/24d2f7a6e6700c10c863f826f37bb653d70e3a83) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Properly handle hydration for namespaced components

## 0.8.3

### Patch Changes

- [#4248](https://github.com/withastro/astro/pull/4248) [`869d00935`](https://github.com/withastro/astro/commit/869d0093596b709cfcc1a1a95ee631b48d6d1c26) Thanks [@svemat01](https://github.com/svemat01)! - Load builtin rehype plugins before user plugins instead of after

* [#4255](https://github.com/withastro/astro/pull/4255) [`411612808`](https://github.com/withastro/astro/commit/4116128082121ee276d51cb245bf8095be4728a1) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Pass injected frontmatter from remark and rehype plugins to layouts

* Updated dependencies [[`1f0dd31d9`](https://github.com/withastro/astro/commit/1f0dd31d9239b5e3dca99c88d021e7a9a3e2054d)]:
  - @astrojs/prism@1.0.1

## 0.8.2

### Patch Changes

- [#4237](https://github.com/withastro/astro/pull/4237) [`9d5ab5508`](https://github.com/withastro/astro/commit/9d5ab55086964fbede17da3d78c209c6d8d13711) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update "Astro.props.content" -> "Astro.props.frontmatter" in README

## 0.8.1

### Patch Changes

- Updated dependencies [[`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308)]:
  - @astrojs/prism@1.0.0

## 0.8.0

### Minor Changes

- [#4204](https://github.com/withastro/astro/pull/4204) [`4c2ca5352`](https://github.com/withastro/astro/commit/4c2ca5352d0c4119ed2a9e5e0b78ce71eb1b414a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Remove `frontmatterOptions` from MDX config

### Patch Changes

- [#4205](https://github.com/withastro/astro/pull/4205) [`6c9736cbc`](https://github.com/withastro/astro/commit/6c9736cbc90162f1de3ebccd7cfe98332749b639) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add frontmatter injection instructions to README

## 0.7.0

### Minor Changes

- [#4176](https://github.com/withastro/astro/pull/4176) [`2675b8633`](https://github.com/withastro/astro/commit/2675b8633c5d5c45b237ec87940d5eaf1bfb1b4b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support frontmatter injection for MD and MDX using remark and rehype plugins

### Patch Changes

- [#4181](https://github.com/withastro/astro/pull/4181) [`77cede720`](https://github.com/withastro/astro/commit/77cede720b09bce34f29c3d2d8b505311ce876b1) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Make collect-headings rehype plugin non-overridable

* [#4174](https://github.com/withastro/astro/pull/4174) [`8eb3a8c6d`](https://github.com/withastro/astro/commit/8eb3a8c6d9554707963c3a3bc36ed8b68d3cf0fb) Thanks [@matthewp](https://github.com/matthewp)! - Allows using React with automatic imports alongside MDX

- [#4145](https://github.com/withastro/astro/pull/4145) [`c7efcf57e`](https://github.com/withastro/astro/commit/c7efcf57e00a0fcde3bc9f813e3cc59902bd484c) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Fix a missing newline bug when `layout` was set.

## 0.6.0

### Minor Changes

- [#4134](https://github.com/withastro/astro/pull/4134) [`2968ba2b6`](https://github.com/withastro/astro/commit/2968ba2b6f00775b6e9872681b390cb466fdbfa2) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add `headings` and `frontmatter` properties to layout props

## 0.5.0

### Minor Changes

- [#4095](https://github.com/withastro/astro/pull/4095) [`40ef43a59`](https://github.com/withastro/astro/commit/40ef43a59b08a1a8fbcd9f4a53745a9636a4fbb9) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add IDs to MDX headings and expose via getHeadings() export

* [#4114](https://github.com/withastro/astro/pull/4114) [`64432bcb8`](https://github.com/withastro/astro/commit/64432bcb873efd0e4297c00fc9583a1fe516dfe7) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Refactor `@astrojs/mdx` and `@astrojs/markdown-remark` to use `@astrojs/prism` instead of duplicating the code

### Patch Changes

- [#4112](https://github.com/withastro/astro/pull/4112) [`e33fc9bc4`](https://github.com/withastro/astro/commit/e33fc9bc46ff0a30013deb6dc76e545e70cc3a3e) Thanks [@matthewp](https://github.com/matthewp)! - Fix MDX working with a ts config file

* [#4049](https://github.com/withastro/astro/pull/4049) [`b60cc0538`](https://github.com/withastro/astro/commit/b60cc0538bc5c68dd411117780d20d892530789d) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve `injectScript` handling for non-Astro pages

* Updated dependencies [[`64432bcb8`](https://github.com/withastro/astro/commit/64432bcb873efd0e4297c00fc9583a1fe516dfe7)]:
  - @astrojs/prism@0.7.0

## 0.4.0

### Minor Changes

- [#4088](https://github.com/withastro/astro/pull/4088) [`1743fe140`](https://github.com/withastro/astro/commit/1743fe140eb58d60e26cbd11a066bb60de046e0c) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support "layout" frontmatter property

## 0.3.1

### Patch Changes

- [#4076](https://github.com/withastro/astro/pull/4076) [`6120a71e5`](https://github.com/withastro/astro/commit/6120a71e5425ad55a17ddac800d64a3f50273bce) Thanks [@matthewp](https://github.com/matthewp)! - Ensure file and url are always present in MDX for Astro.glob

## 0.3.0

### Minor Changes

- [#3977](https://github.com/withastro/astro/pull/3977) [`19433eb4a`](https://github.com/withastro/astro/commit/19433eb4a4441522f68492ca914ad2ab4f061343) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add remarkPlugins and rehypePlugins to config, with the same default plugins as our standard Markdown parser

* [#4002](https://github.com/withastro/astro/pull/4002) [`3b8a74452`](https://github.com/withastro/astro/commit/3b8a7445247221100462ba035f6778b43ea180e7) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support Prism and Shiki syntax highlighting based on project config

- [#3995](https://github.com/withastro/astro/pull/3995) [`b2b367c96`](https://github.com/withastro/astro/commit/b2b367c969493aaf21c974064beb241d05228066) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support YAML frontmatter in MDX files

### Patch Changes

- [#4050](https://github.com/withastro/astro/pull/4050) [`9ab66c4ba`](https://github.com/withastro/astro/commit/9ab66c4ba9bf2250990114c76b792f26d0694365) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Add support for injected "page-ssr" scripts

* [#3981](https://github.com/withastro/astro/pull/3981) [`61fec6304`](https://github.com/withastro/astro/commit/61fec63044e1585348e8405bee6fdf4dec635efa) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Include page url in MDX glob result

## 0.2.1

### Patch Changes

- [#3937](https://github.com/withastro/astro/pull/3937) [`31f9c0bf0`](https://github.com/withastro/astro/commit/31f9c0bf029ffa4b470e620f2c32e1370643e81e) Thanks [@delucis](https://github.com/delucis)! - Roll back supported Node engines

## 0.2.0

### Minor Changes

- [#3914](https://github.com/withastro/astro/pull/3914) [`b48767985`](https://github.com/withastro/astro/commit/b48767985359bd359df8071324952ea5f2bc0d86) Thanks [@ran-dall](https://github.com/ran-dall)! - Rollback supported `node@16` version. Minimum versions are now `node@14.20.0` or `node@16.14.0`.

## 0.1.1

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.1.0

### Minor Changes

- [#3871](https://github.com/withastro/astro/pull/3871) [`1cc5b7890`](https://github.com/withastro/astro/commit/1cc5b78905633608e5b07ad291f916f54e67feb1) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update supported `node` versions. Minimum versions are now `node@14.20.0` or `node@16.16.0`.

## 0.0.3

### Patch Changes

- [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

## 0.0.2

### Patch Changes

- [#3706](https://github.com/withastro/astro/pull/3706) [`032ad1c0`](https://github.com/withastro/astro/commit/032ad1c047a62dd663067cc562537d16f2872aa7) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Initial release! 🎉
