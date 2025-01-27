import { h } from 'preact';

export default function PreactRuntimeError({shouldThrow = true}) {
  if (shouldThrow) throw new Error('PreactRuntimeError')
  return <div>I shouldn’t be here</div>;
}
