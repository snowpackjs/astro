<script>
  import './logResize';

  let count = $state(parseInt(localStorage.getItem('test:count')) || 0)
  $effect(() => localStorage.setItem('test:count', count));

  function add() {
    count += 1;
  }

  function subtract() {
    count -= 1;
  }
</script>
<style>
	button {
		background: yellowgreen;
	}
</style>
<div class="counter">
  <button onclick={subtract}>-</button>
  <pre>{ count }</pre>
  <button onclick={add}>+</button>
</div>
