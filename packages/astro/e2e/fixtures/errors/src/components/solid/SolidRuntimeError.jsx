import { h } from 'solid-js/web';

export default function SolidRuntimeError({shouldThrow = true}) {
  if (shouldThrow) throw new Error('SolidRuntimeError')
  return <div>I shouldn’t be here</div>;
}
