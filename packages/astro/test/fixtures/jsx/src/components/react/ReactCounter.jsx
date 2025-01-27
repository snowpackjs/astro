import React, { useState } from 'react';

/** a counter written in React */
export default function ReactCounter() {
  const [count, setCount] = useState(0);
  const add = () => setCount((i) => i + 1);
  const subtract = () => setCount((i) => i - 1);

	debugger;

  return (
    <div id="react">
      <div className="counter">
        <button onClick={subtract}>-</button>
        <pre>{count}</pre>
        <button onClick={add}>+</button>
      </div>
      <div className="children">React</div>
    </div>
  );
}
