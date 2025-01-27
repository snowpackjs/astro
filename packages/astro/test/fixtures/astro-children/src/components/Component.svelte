<script>
    let { children } = $props();
</script>

<div id="svelte">
    {@render children?.()}
</div>
