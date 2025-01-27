<script>
	let { id, children } = $props();
</script>
<div {id}>Slot goes here:{@render children?.()}</div>
