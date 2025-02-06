// The `ts-ignore` comments here are necessary because we're importing this file inside the `astro:components`
// virtual module's types, which means that `tsc` will try to resolve these imports.
// @ts-ignore
export { default as Code } from './Code.astro';
// @ts-ignore
export { default as Debug } from './Debug.astro';
