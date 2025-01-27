# vite-plugin-config-alias

This adds aliasing support to Vite from `tsconfig.json` or `jsconfig.json` files.

Consider the following example configuration:

```
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "components:*": ["components/*.astro"]
    }
  }
}
```

With this configuration, the following imports would map to the same location.

```js
import Test from '../components/Test.astro';

import Test from 'components/Test.astro';

import Test from 'components:Test';
```
