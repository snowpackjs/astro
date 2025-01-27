# @astrojs/prism

Supports Prism highlighting in Astro projects

## Component

This package exports a component to support highlighting inside an Astro file. Example:

```astro
---
import { Prism } from '@astrojs/prism';
---

<Prism lang="js" code={`const foo = 'bar';`} />
```

## Internal

This package exports a `runHighlighterWithAstro` function to highlight while making sure the Astro language is loaded beforehand

```typescript
import { runHighlighterWithAstro } from '@astrojs/prism';

runHighlighterWithAstro(
  `
  ---
    const helloAstro = 'Hello, Astro!';
  ---

  <div>{helloAstro}</div>
`,
  'astro',
);
```
