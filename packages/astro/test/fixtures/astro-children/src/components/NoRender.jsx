import { h } from 'preact';

export default function PreactComponent({ id, children, render = false }) {
  return <div id={id} class="preact-no-children">{render && children}</div>;
}
