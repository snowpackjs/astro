import { createElement } from 'react';
import { hydrate } from 'react-dom';
import StaticHtml from './static-html.js';

export default (element) => (Component, props, children) =>
  hydrate(
    createElement(Component, { ...props, suppressHydrationWarning: true }, children ? createElement(StaticHtml, { value: children, suppressHydrationWarning: true }) : undefined),
    element
  );
