import { h } from 'preact';
import { useState } from 'preact/hooks';

export default function() {
  const [val] = useState('world');
  return <div id={val}></div>;
}