// This module is a simple wrapper around react/jsx-runtime so that
// it can run in Node ESM. 'react' doesn't declare this module as an export map
// So we have to use the .js. The .js is not added via the babel automatic JSX transform
// hence this module as a workaround.
import jsxr from 'react/jsx-runtime.js';
const { jsx, jsxs, Fragment } = jsxr;

export { jsx, jsxs, Fragment };
