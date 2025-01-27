// Q: Why this file?
// A: Our language tooling needs to access the JSX types from `astro/jsx-runtime`, due to TS limitations, however we
// can't import `astro-jsx` types inside the actual `jsx-runtime/index.js` file due to circular dependency issues.
import './astro-jsx.js';
export * from './dist/jsx-runtime/index.js';
export import JSX = astroHTML.JSX;
