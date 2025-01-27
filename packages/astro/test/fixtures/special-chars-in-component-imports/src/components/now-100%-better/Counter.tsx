import React, { useState } from 'react';

export default function Counter ({ id }) {
  const [count, setCount] = useState(0);

  return (
    <div id={id}>
      <div>{id}: {count}</div>
      <button type="button" onClick={() => setCount(count+1)}>Increment</button>
    </div>
  );
}
