
<script>
	let count = $state(0);

  function add() {
		count += 1;
	}

  function subtract() {
		count -= 1;
	}
</script>

<div id="svelte">
	<div class="counter">
		<button onclick={subtract}>-</button>
		<pre>{count}</pre>
		<button onclick={add}>+</button>
	</div>
	<div class="children">Svelte</div>
</div>
