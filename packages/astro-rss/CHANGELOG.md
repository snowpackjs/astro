# @astrojs/rss

## 4.0.11

### Patch Changes

- [#12829](https://github.com/withastro/astro/pull/12829) [`ebe2aa9`](https://github.com/withastro/astro/commit/ebe2aa95c7f4a6559cec8b82d155da34a57bdd53) Thanks [@SapphicMoe](https://github.com/SapphicMoe)! - Revert incorrect Content-Type header applied for RSS XML file

## 4.0.10

### Patch Changes

- [#12644](https://github.com/withastro/astro/pull/12644) [`5b9b618`](https://github.com/withastro/astro/commit/5b9b6181839d8ae0ad0a0d475257b7e09f748950) Thanks [@kunyan](https://github.com/kunyan)! - Sends the standard RSS content type response header, with UTF-8 charset

## 4.0.9

### Patch Changes

- [#12157](https://github.com/withastro/astro/pull/12157) [`925cff3`](https://github.com/withastro/astro/commit/925cff31bc040874e73decd6a6b3a5ba84c60258) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Improves README configuration reference.

## 4.0.8

### Patch Changes

- [#12137](https://github.com/withastro/astro/pull/12137) [`50dd88b`](https://github.com/withastro/astro/commit/50dd88bc6611243e3f1b2df643af6d0b551fe140) Thanks [@ArmandPhilippot](https://github.com/ArmandPhilippot)! - Fixes an error that occurred when the optional `pubDate` property was missing in an item.

- [#12137](https://github.com/withastro/astro/pull/12137) [`50dd88b`](https://github.com/withastro/astro/commit/50dd88bc6611243e3f1b2df643af6d0b551fe140) Thanks [@ArmandPhilippot](https://github.com/ArmandPhilippot)! - Fixes an error where docs incorrectly stated the `title`, `link` and `pubDate` properties of RSS items was required.

## 4.0.7

### Patch Changes

- [#11299](https://github.com/withastro/astro/pull/11299) [`8ce66f2`](https://github.com/withastro/astro/commit/8ce66f2ef7328546d823f1076f9bab4217a6be7d) Thanks [@ematipico](https://github.com/ematipico)! - Fixes an issue where the `pagesGlobToRssItems` returned an incorrect type for `items`

## 4.0.6

### Patch Changes

- [#11050](https://github.com/withastro/astro/pull/11050) [`841df1f`](https://github.com/withastro/astro/commit/841df1f1b192f39849509cda49b7243940cc30f9) Thanks [@mingjunlu](https://github.com/mingjunlu)! - Fixes an issue where trailing slash is not removed even if the `trailingSlash` option is set to `false`.

## 4.0.5

### Patch Changes

- [#9967](https://github.com/withastro/astro/pull/9967) [`8b8f26fdf2af2a769f4846bdaaf4cf6b30f9e37c`](https://github.com/withastro/astro/commit/8b8f26fdf2af2a769f4846bdaaf4cf6b30f9e37c) Thanks [@madcampos](https://github.com/madcampos)! - Allows `enclosure' to have a length of 0

## 4.0.4

### Patch Changes

- [#9797](https://github.com/withastro/astro/pull/9797) [`457e8b6422704ba23347c766a8bb9c101c2aba0b`](https://github.com/withastro/astro/commit/457e8b6422704ba23347c766a8bb9c101c2aba0b) Thanks [@wkillerud](https://github.com/wkillerud)! - Restores `rssSchema` to a zod object

## 4.0.3

### Patch Changes

- [#9746](https://github.com/withastro/astro/pull/9746) [`7356336d18c916804001bdf64bff5445d82baceb`](https://github.com/withastro/astro/commit/7356336d18c916804001bdf64bff5445d82baceb) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Fixes `rssSchema` definition to allow calling standard zod object methods (like `extend`)

## 4.0.2

### Patch Changes

- [#9610](https://github.com/withastro/astro/pull/9610) [`24663c9695385fed9ece57bf4aecdca3a8581e70`](https://github.com/withastro/astro/commit/24663c9695385fed9ece57bf4aecdca3a8581e70) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Fixes the RSS schema to make the `title` optional if the description is already provided. It also makes `pubDate` and `link` optional, as specified in the RSS specification.

## 4.0.1

### Patch Changes

- [#9299](https://github.com/withastro/astro/pull/9299) [`edfae50e6`](https://github.com/withastro/astro/commit/edfae50e6ea494f49c6d4fbf4bd4481870f994b1) Thanks [@cdvillard](https://github.com/cdvillard)! - Improves the `@astrojs/rss` error message thrown when the object passed to the `items` property is missing any of the three required keys or if one of those keys is mistyped.

## 4.0.0

### Major Changes

- [#9168](https://github.com/withastro/astro/pull/9168) [`153a5abb9`](https://github.com/withastro/astro/commit/153a5abb905042ac68b712514dc9ec387d3e6b17) Thanks [@bluwy](https://github.com/bluwy)! - Removes the deprecated (in v3.0) `drafts` option as the feature is deprecated in Astro 3.0

## 4.0.0-beta.0

### Major Changes

- [#9168](https://github.com/withastro/astro/pull/9168) [`153a5abb9`](https://github.com/withastro/astro/commit/153a5abb905042ac68b712514dc9ec387d3e6b17) Thanks [@bluwy](https://github.com/bluwy)! - Removes the `drafts` option as the feature is deprecated in Astro 3.0

## 3.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8198](https://github.com/withastro/astro/pull/8198) [`cb95aa5f8`](https://github.com/withastro/astro/commit/cb95aa5f8e0b04eba1a56e3e4a7901d40f1c854b) Thanks [@bluwy](https://github.com/bluwy)! - Update the `rss()` default export to return a `Response` instead of a simple object, which is deprecated in Astro 3.0. If you were directly returning the `rss()` result from an endpoint before, this breaking change should not affect you.

  You can also import `getRssString()` to get the RSS string directly and use it to return your own Response:

  ```ts
  // src/pages/rss.xml.js
  import { getRssString } from '@astrojs/rss';

  export async function get(context) {
    const rssString = await getRssString({
      title: 'Buzz’s Blog',
      ...
    });

    return new Response(rssString, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
  ```

### Patch Changes

- [#8099](https://github.com/withastro/astro/pull/8099) [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969) Thanks [@bluwy](https://github.com/bluwy)! - Deprecate the `markdown.drafts` configuration option.

  If you'd like to create draft pages that are visible in dev but not in production, you can [migrate to content collections](https://docs.astro.build/en/guides/content-collections/#migrating-from-file-based-routing) and [manually filter out pages](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries) with the `draft: true` frontmatter property instead.

## 3.0.0-rc.2

### Major Changes

- [#8198](https://github.com/withastro/astro/pull/8198) [`cb95aa5f8`](https://github.com/withastro/astro/commit/cb95aa5f8e0b04eba1a56e3e4a7901d40f1c854b) Thanks [@bluwy](https://github.com/bluwy)! - Update the `rss()` default export to return a `Response` instead of a simple object, which is deprecated in Astro 3.0. If you were directly returning the `rss()` result from an endpoint before, this breaking change should not affect you.

  You can also import `getRssString()` to get the RSS string directly and use it to return your own Response:

  ```ts
  // src/pages/rss.xml.js
  import { getRssString } from '@astrojs/rss';

  export async function get(context) {
    const rssString = await getRssString({
      title: 'Buzz’s Blog',
      ...
    });

    return new Response(rssString, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
  ```

## 3.0.0-rc.1

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Patch Changes

- [#8099](https://github.com/withastro/astro/pull/8099) [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969) Thanks [@bluwy](https://github.com/bluwy)! - Deprecate the `markdown.drafts` configuration option.

  If you'd like to create draft pages that are visible in dev but not in production, you can [migrate to content collections](https://docs.astro.build/en/guides/content-collections/#migrating-from-file-based-routing) and [manually filter out pages](https://docs.astro.build/en/guides/content-collections/#filtering-collection-queries) with the `draft: true` frontmatter property instead.

## 3.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 2.4.4

### Patch Changes

- [#7964](https://github.com/withastro/astro/pull/7964) [`51028f85c`](https://github.com/withastro/astro/commit/51028f85c68944872a65b4bc0b8fcb6c3f3cf496) Thanks [@DerTimonius](https://github.com/DerTimonius)! - Add URL to RSSOptions.site type

## 2.4.3

### Patch Changes

- [#7153](https://github.com/withastro/astro/pull/7153) [`e17ed0727`](https://github.com/withastro/astro/commit/e17ed0727ef1acb512c77723a1b641326de8ca84) Thanks [@AkashRajpurohit](https://github.com/AkashRajpurohit)! - exposes RSSFeedItem type

## 2.4.2

### Patch Changes

- [#7066](https://github.com/withastro/astro/pull/7066) [`a37e67b52`](https://github.com/withastro/astro/commit/a37e67b520dc35dbf40313c77490a97446de2f74) Thanks [@TheOtterlord](https://github.com/TheOtterlord)! - Fix pubDate schema transformation

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

## 2.4.1

### Patch Changes

- [#6970](https://github.com/withastro/astro/pull/6970) [`b5482cee2`](https://github.com/withastro/astro/commit/b5482cee2387149ff397447e546130ba3dea58db) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: remove accidental stripping of trailing `/1/` on canonical URLs

## 2.4.0

### Minor Changes

- [#6707](https://github.com/withastro/astro/pull/6707) [`4ea716e56`](https://github.com/withastro/astro/commit/4ea716e5692d23361e9301330ce52733b3d05b01) Thanks [@philnash](https://github.com/philnash)! - Added extra elements to the RSS items, including categories and enclosure

## 2.3.2

### Patch Changes

- [#6614](https://github.com/withastro/astro/pull/6614) [`b1b9b1390`](https://github.com/withastro/astro/commit/b1b9b1390f95c6ae91389eba55f7563b911bccc7) Thanks [@aivarsliepa](https://github.com/aivarsliepa)! - Fixes `RSSOptions` type error when using `strictest` Typescript tsconfig

## 2.3.1

### Patch Changes

- [#6538](https://github.com/withastro/astro/pull/6538) [`400ef26c9`](https://github.com/withastro/astro/commit/400ef26c998a586b29c2f3931e63c1c5801d3bea) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Preserve self-closing tags in `customData` option

## 2.3.0

### Minor Changes

- [#6453](https://github.com/withastro/astro/pull/6453) [`2e362042c`](https://github.com/withastro/astro/commit/2e362042c222298fd6cd80a64c1d7b7f3f608a79) Thanks [@ematipico](https://github.com/ematipico)! - Added `trailingSlash` option to control whether or not the emitted URLs should have trailing slashes.

  ```js
  import rss from '@astrojs/rss';

  export const get = () =>
    rss({
      trailingSlash: false,
    });
  ```

  By passing `false`, the emitted links won't have trailing slashes.

## 2.2.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 2.1.1

### Patch Changes

- [#6259](https://github.com/withastro/astro/pull/6259) [`dbffee4e3`](https://github.com/withastro/astro/commit/dbffee4e381e74882734039783fae312d3893f2a) Thanks [@y-nk](https://github.com/y-nk)! - Improve RSS schema errors with additional property name context

## 2.1.0

### Minor Changes

- [#5851](https://github.com/withastro/astro/pull/5851) [`81dce94f2`](https://github.com/withastro/astro/commit/81dce94f2a6db598bd9e47fc2a4b9d713e58f286) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update RSS config for readability and consistency with Astro 2.0.

  - **Migration - `import.meta.glob()` handling**

    We have deprecated `items: import.meta.glob(...)` handling in favor of a separate `pagesGlobToRssItems()` helper. This simplifies our `items` configuration option to accept a single type, without losing existing functionality.

    If you rely on our `import.meta.glob()` handling, we suggest adding the `pagesGlobToRssItems()` wrapper to your RSS config:

    ```diff
    // src/pages/rss.xml.js
    import rss, {
    +  pagesGlobToRssItems
    } from '@astrojs/rss';

    export function get(context) {
      return rss({
    +    items: pagesGlobToRssItems(
          import.meta.glob('./blog/*.{md,mdx}'),
    +    ),
      });
    }
    ```

  - **New `rssSchema` for content collections**

    `@astrojs/rss` now exposes an `rssSchema` for use with content collections. This ensures all RSS feed properties are present in your frontmatter:

    ```ts
    import { defineCollection } from 'astro:content';
    import { rssSchema } from '@astrojs/rss';

    const blog = defineCollection({
      schema: rssSchema,
    });

    export const collections = { blog };
    ```

## 2.1.0-beta.0

<details>
<summary>See changes in 2.1.0-beta.0</summary>

### Minor Changes

- [#5851](https://github.com/withastro/astro/pull/5851) [`81dce94f2`](https://github.com/withastro/astro/commit/81dce94f2a6db598bd9e47fc2a4b9d713e58f286) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update RSS config for readability and consistency with Astro 2.0.

  - **Migration - `import.meta.glob()` handling**

    We have deprecated `items: import.meta.glob(...)` handling in favor of a separate `pagesGlobToRssItems()` helper. This simplifies our `items` configuration option to accept a single type, without losing existing functionality.

    If you rely on our `import.meta.glob()` handling, we suggest adding the `pagesGlobToRssItems()` wrapper to your RSS config:

    ```diff
    // src/pages/rss.xml.js
    import rss, {
    +  pagesGlobToRssItems
    } from '@astrojs/rss';

    export function get(context) {
      return rss({
    +    items: pagesGlobToRssItems(
          import.meta.glob('./blog/*.{md,mdx}'),
    +    ),
      });
    }
    ```

  - **New `rssSchema` for content collections**

    `@astrojs/rss` now exposes an `rssSchema` for use with content collections. This ensures all RSS feed properties are present in your frontmatter:

    ```ts
    import { defineCollection } from 'astro:content';
    import { rssSchema } from '@astrojs/rss';

    const blog = defineCollection({
      schema: rssSchema,
    });

    export const collections = { blog };
    ```

</details>

## 2.0.0

### Major Changes

- [#5612](https://github.com/withastro/astro/pull/5612) [`68c20be66`](https://github.com/withastro/astro/commit/68c20be66b197e6c525cd292823a3a728f238547) Thanks [@equt](https://github.com/equt)! - Filter out draft in RSS generation

## 1.2.1

### Patch Changes

- [#5600](https://github.com/withastro/astro/pull/5600) [`c4155daea`](https://github.com/withastro/astro/commit/c4155daeabe1b8191ad9ed1fa5893759f1fe5c4c) Thanks [@fflaten](https://github.com/fflaten)! - Fix missing type-attribute in xml-stylesheet

## 1.2.0

### Minor Changes

- [`c76e1c810`](https://github.com/withastro/astro/commit/c76e1c810228fb53cd9c34edc73747b0ab64dc28) Thanks [@mattstein](https://github.com/mattstein)! - Fixes a bug that prevented an item’s `customData` from being included.

## 1.1.0

### Minor Changes

- [#5366](https://github.com/withastro/astro/pull/5366) [`081e0a9d2`](https://github.com/withastro/astro/commit/081e0a9d2070b23d596b687ad52ed3a68bc3ac24) Thanks [@smithbm2316](https://github.com/smithbm2316)! - Added the ability for users to include the full content of their posts/items in each RSS feed entry
  via the new `content` key on the `RSSFeedItem` model.

### Patch Changes

- [#5550](https://github.com/withastro/astro/pull/5550) [`fe0da0185`](https://github.com/withastro/astro/commit/fe0da0185a85762ac5ac5bf66ea91947af1c329d) Thanks [@andersk](https://github.com/andersk)! - Generate RSS feed with proper XML escaping

## 1.0.3

### Patch Changes

- [#5164](https://github.com/withastro/astro/pull/5164) [`4a8a346ca`](https://github.com/withastro/astro/commit/4a8a346ca9a6d6ed8def2fa32329c1db922893d2) Thanks [@MoustaphaDev](https://github.com/MoustaphaDev)! - Add support for markdown files with the following extensions:
  - `.markdown`
  - `.mdown`
  - `.mkdn`
  - `.mkd`
  - `.mdwn`

## 1.0.2

### Patch Changes

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Add missing dependencies, support strict dependency installation (e.g. pnpm)

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Remove path-browserify dependency

## 1.0.1

### Patch Changes

- [#4701](https://github.com/withastro/astro/pull/4701) [`6e1d62fe2`](https://github.com/withastro/astro/commit/6e1d62fe222e45b763b2b60b377b07e431950d54) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix globs for homepage route

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.2.2

### Patch Changes

- [#3956](https://github.com/withastro/astro/pull/3956) [`57e529e4c`](https://github.com/withastro/astro/commit/57e529e4c13f3e7829311ac6f92682eb6333fd96) Thanks [@esafev](https://github.com/esafev)! - Throw the error when 'site' option is missing

## 0.2.1

### Patch Changes

- [#3913](https://github.com/withastro/astro/pull/3913) [`cd2dbfedb`](https://github.com/withastro/astro/commit/cd2dbfedb15969274df40b1c41b6680ea8885e8d) Thanks [@matthewp](https://github.com/matthewp)! - Adds error messages for missing required fields

## 0.2.0

### Minor Changes

- [#3301](https://github.com/withastro/astro/pull/3301) [`0efaf110`](https://github.com/withastro/astro/commit/0efaf110fceba149cd41cbaa0f37311e6887cdec) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Change the optional "canonicalUrl" argument to a required "site" argument. This fixes problems with import.meta.env.SITE. If you want to use your project's "site" field for your RSS feeds, set site: import.meta.env.SITE in the rss function options

## 0.1.1

### Patch Changes

- [`1032e450`](https://github.com/withastro/astro/commit/1032e450cc224e603e8e69ef1422de6dbf184dd2) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Introduce new @astrojs/rss package for RSS feed generation! This also adds a new global env variable for your project's configured "site": import.meta.env.SITE. This is consumed by the RSS feed helper to generate the correct canonical URL.
