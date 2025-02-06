<!-- @component
A counter written with Svelte
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props();
	let count = $state(0);

	function add() {
		count += 1;
	}

	function subtract() {
		count -= 1;
	}
</script>

<div class="counter">
	<button onclick={subtract}>-</button>
	<pre>{count}</pre>
	<button onclick={add}>+</button>
</div>
<div class="counter-message">
	{@render children?.()}
</div>
