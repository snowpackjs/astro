import React from 'react';

export default function ReactRuntimeError({shouldThrow = true}) {
  if (shouldThrow) throw new Error('ReactRuntimeError')
  return <div>I shouldn’t be here</div>;
}
