// Test introduced to ensure JSX is correctly transformed
// See https://github.com/withastro/astro/issues/3371
import { createSignal } from 'solid-js';

export default function WithNewlines() {
  const [count] = createSignal(0);

  return (
    <>
      <div class="multiline
			
			css-classes">Hello world - {count}</div>
    </>
  );
}
