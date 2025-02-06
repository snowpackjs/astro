import { createSignal } from 'solid-js';

export default function Counter() {
  const [count] = createSignal(0);

  return (
    <>
      <div class="hello">Hello world - {count}</div>
    </>
  );
}
