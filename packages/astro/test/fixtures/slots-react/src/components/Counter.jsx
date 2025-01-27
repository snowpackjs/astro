import React, { useState } from 'react';

export default function Counter({ named, dashCase, children, count: initialCount, case: id }) {
  const [count, setCount] = useState(initialCount);
  const add = () => setCount((i) => i + 1);
  const subtract = () => setCount((i) => i - 1);

  return (
    <>
      <div className="counter">
        <button onClick={subtract}>-</button>
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
      <div id={id} className="counter-message">
        {children || <h1>Fallback</h1>}
				{named}
				{dashCase}
      </div>
    </>
  );
}
