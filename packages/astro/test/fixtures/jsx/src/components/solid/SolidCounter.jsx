import { createSignal } from 'solid-js';

/** a counter written with Solid */
export default function SolidCounter() {
  const [count, setCount] = createSignal(0);
  const add = () => setCount(count() + 1);
  const subtract = () => setCount(count() - 1);

  return (
    <div id="solid">
      <div class="counter">
        <button onClick={subtract}>-</button>
        <pre>{count()}</pre>
        <button onClick={add}>+</button>
      </div>
      <div class="children">Solid</div>
    </div>
  );
}
