<script>
	let { shouldThrow } = $props();

  if (shouldThrow) {
    throw new Error('SvelteRuntimeError');
  }
</script>

<h1>I shouldn’t be here</h1>
