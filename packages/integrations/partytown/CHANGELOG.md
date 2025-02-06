# @astrojs/partytown

## 2.1.3

### Patch Changes

- [#12822](https://github.com/withastro/astro/pull/12822) [`1fab2f2`](https://github.com/withastro/astro/commit/1fab2f2ef671cc265c8dd46c5858915f971f2478) Thanks [@stdavis](https://github.com/stdavis)! - Updates the partytown dependency to the new npm org name and latest version.

## 2.1.2

### Patch Changes

- [#11829](https://github.com/withastro/astro/pull/11829) [`f1df1b3`](https://github.com/withastro/astro/commit/f1df1b3b462309444a9a50ecbf229840dff8c9d0) Thanks [@oosawy](https://github.com/oosawy)! - Prevent Partytown integration from inserting a 'null' string into the body

## 2.1.1

### Patch Changes

- [#11083](https://github.com/withastro/astro/pull/11083) [`416c4ac`](https://github.com/withastro/astro/commit/416c4ac66d432d4c5abd13a4c7ecd20defb4fc30) Thanks [@V3RON](https://github.com/V3RON)! - Prevent Partytown from crashing when View Transitions are enabled

  When View Transitions are turned on, Partytown executes on every transition.
  It's not meant to be like that, and therefore it breaks the integration completely.
  Starting from now, Partytown will be executed only once.

## 2.1.0

### Minor Changes

- [#10833](https://github.com/withastro/astro/pull/10833) [`8d5f3e8`](https://github.com/withastro/astro/commit/8d5f3e8656027023f9fda51c66b0213ffe16d3a5) Thanks [@renovate](https://github.com/apps/renovate)! - Updates the `@builder.io/partytown` dependency to v0.10. This should not affect projects in most cases.

## 2.0.4

### Patch Changes

- [#9666](https://github.com/withastro/astro/pull/9666) [`cdf8ce06271b8b5e474186a3cd6d7925c423a4a6`](https://github.com/withastro/astro/commit/cdf8ce06271b8b5e474186a3cd6d7925c423a4a6) Thanks [@martrapp](https://github.com/martrapp)! - Fixes an issue where Partytown scripts didn't execute after view transition

## 2.0.3

### Patch Changes

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 2.0.2

### Patch Changes

- [#8892](https://github.com/withastro/astro/pull/8892) [`e21fef7da`](https://github.com/withastro/astro/commit/e21fef7da2292414f55b58ffe7d9bbfd25904ca3) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds the ability to override the `lib` option in `astro.config.mjs`

## 2.0.1

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

- [#8740](https://github.com/withastro/astro/pull/8740) [`f277ba8b7`](https://github.com/withastro/astro/commit/f277ba8b703037635bc7adee84d51eaf7dafd388) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Expose types for TypeScript users

## 2.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 2.0.0-rc.1

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 2.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 1.2.3

### Patch Changes

- [#7175](https://github.com/withastro/astro/pull/7175) [`59d8c50b8`](https://github.com/withastro/astro/commit/59d8c50b8426cd6825abc07405041779b7999022) Thanks [@AkashRajpurohit](https://github.com/AkashRajpurohit)! - fix typescript type for partytown options

## 1.2.2

### Patch Changes

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

## 1.2.1

### Patch Changes

- [#7001](https://github.com/withastro/astro/pull/7001) [`ad5c75447`](https://github.com/withastro/astro/commit/ad5c75447af9cfbdcb1f288c5c17229fbd3d6dd2) Thanks [@Waxer59](https://github.com/Waxer59)! - Fixed a code example that was wrongly closed

## 1.2.0

### Minor Changes

- [#6667](https://github.com/withastro/astro/pull/6667) [`aff53c109`](https://github.com/withastro/astro/commit/aff53c109c4f7b08b6b80e58e9ca5cb481131eb5) Thanks [@thebinarymutant](https://github.com/thebinarymutant)! - Expose more partytown config properties

## 1.1.1

### Patch Changes

- [#6494](https://github.com/withastro/astro/pull/6494) [`a13e9d7e3`](https://github.com/withastro/astro/commit/a13e9d7e33baccf51e7d4815f99b481ad174bc57) Thanks [@Yan-Thomas](https://github.com/Yan-Thomas)! - Consistency improvements to several package descriptions

## 1.1.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 1.0.3

### Patch Changes

- [#5936](https://github.com/withastro/astro/pull/5936) [`77ae7a597`](https://github.com/withastro/astro/commit/77ae7a597a8fdd5c939291b4f63237c659a79225) Thanks [@rishi-raj-jain](https://github.com/rishi-raj-jain)! - fix trailing slash with base path

- [#5820](https://github.com/withastro/astro/pull/5820) [`813073add`](https://github.com/withastro/astro/commit/813073addd669538d67032a48ef6b649216dafc5) Thanks [@davlet61](https://github.com/davlet61)! - Bumps `@builder.io/partytown` version in partytown integration to fix deprecation warning in pagespeed insights

## 1.0.3-beta.1

<details>
<summary>See changes in 1.0.3-beta.1</summary>

### Patch Changes

- [#5936](https://github.com/withastro/astro/pull/5936) [`77ae7a597`](https://github.com/withastro/astro/commit/77ae7a597a8fdd5c939291b4f63237c659a79225) Thanks [@rishi-raj-jain](https://github.com/rishi-raj-jain)! - fix trailing slash with base path

</details>

## 1.0.3-beta.0

<details>
<summary>See changes in 1.0.3-beta.0</summary>

### Patch Changes

- [#5820](https://github.com/withastro/astro/pull/5820) [`813073add`](https://github.com/withastro/astro/commit/813073addd669538d67032a48ef6b649216dafc5) Thanks [@davlet61](https://github.com/davlet61)! - Bumps `@builder.io/partytown` version in partytown integration to fix deprecation warning in pagespeed insights

</details>

## 1.0.2

### Patch Changes

- [#5425](https://github.com/withastro/astro/pull/5425) [`4266869f4`](https://github.com/withastro/astro/commit/4266869f4fef37fadb2e0c4c0b703decde11037a) Thanks [@brenelz](https://github.com/brenelz)! - fix partytown when base path specified

## 1.0.1

### Patch Changes

- [#4989](https://github.com/withastro/astro/pull/4989) [`50a397c4b`](https://github.com/withastro/astro/commit/50a397c4ba61dffaeb1aaf2a4e262ea79cd1580a) Thanks [@that-joao](https://github.com/that-joao)! - Update @builder.io/partytown dependency

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.1.9

### Patch Changes

- [#4004](https://github.com/withastro/astro/pull/4004) [`ef9c4152b`](https://github.com/withastro/astro/commit/ef9c4152b2b399e25bf4e8aa7b37adcf6d0d8f17) Thanks [@sarah11918](https://github.com/sarah11918)! - [READMEs] removed "experimental" from astro add instructions

## 0.1.8

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.1.7

### Patch Changes

- [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

## 0.1.6

### Patch Changes

- [#3677](https://github.com/withastro/astro/pull/3677) [`8045c8ad`](https://github.com/withastro/astro/commit/8045c8ade16fe4306448b7f98a4560ef0557d378) Thanks [@Jutanium](https://github.com/Jutanium)! - Update READMEs

## 0.1.5

### Patch Changes

- [#3686](https://github.com/withastro/astro/pull/3686) [`b36ecb71`](https://github.com/withastro/astro/commit/b36ecb717e2cb623501c6d9a60471ac4daba43a8) Thanks [@matthewp](https://github.com/matthewp)! - Include partytown scripts in SSR manifest

## 0.1.4

### Patch Changes

- [#3437](https://github.com/withastro/astro/pull/3437) [`78e962f7`](https://github.com/withastro/astro/commit/78e962f744a495b587bc691ad6b109543a5a5dde) Thanks [@caioferrarezi](https://github.com/caioferrarezi)! - Fix partytown script generation to get astro base config option

## 0.1.3

### Patch Changes

- [#3380](https://github.com/withastro/astro/pull/3380) [`31b0bc87`](https://github.com/withastro/astro/commit/31b0bc87a4f6f652d9007810026e99756a32cc46) Thanks [@rotate-mark](https://github.com/rotate-mark)! - Add config options for integration

## 0.1.2

### Patch Changes

- [`815d62f1`](https://github.com/withastro/astro/commit/815d62f151a36fef7d09590d4962ca71bda61b32) Thanks [@FredKSchott](https://github.com/FredKSchott)! - no changes.

## 0.1.1

### Patch Changes

- [#3008](https://github.com/withastro/astro/pull/3008) [`8bd49c95`](https://github.com/withastro/astro/commit/8bd49c95365f7bbce41e19b7e8658ad639c22f31) Thanks [@JuanM04](https://github.com/JuanM04)! - Updated integrations' `astro:build:done` hook: now it matches the client dist when using SSR

## 0.1.1-beta.0

### Patch Changes

- [#3008](https://github.com/withastro/astro/pull/3008) [`8bd49c95`](https://github.com/withastro/astro/commit/8bd49c95365f7bbce41e19b7e8658ad639c22f31) Thanks [@JuanM04](https://github.com/JuanM04)! - Updated integrations' `astro:build:done` hook: now it matches the client dist when using SSR

## 0.1.0

### Minor Changes

- [`e425f896`](https://github.com/withastro/astro/commit/e425f896b668d98033ad3b998b50c1f28bc7f6ee) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Update config options to respect [RFC0019](https://github.com/withastro/rfcs/blob/main/proposals/0019-config-finalization.md)

## 0.0.2

### Patch Changes

- [#2885](https://github.com/withastro/astro/pull/2885) [`6b004363`](https://github.com/withastro/astro/commit/6b004363f99f27e581d1e2d53a2ebff39d7afb8a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add README across Astro built-in integrations

* [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site

## 0.0.2-next.0

### Patch Changes

- [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site
