<script>
	let isNavOpen = $state(false);
  const toggleNav = () => (isNavOpen = !isNavOpen);
</script>

<button id="toggle" onclick={toggleNav}>
  {#if isNavOpen}
      <slot name="open" />
  {:else}
      <slot name="close" />
  {/if}
</button>
