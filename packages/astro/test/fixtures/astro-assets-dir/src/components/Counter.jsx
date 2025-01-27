import React, { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <div>Count: {count}</div>
      <button type="button" onClick={() => setCount(count+1)}>Increment</button>
    </div>
  );
}
