import { h } from 'preact';

export default function ({ name }) {
  return <div id={name}>{name}</div>;
}
