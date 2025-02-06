<script>
	let { path } = $props();
  
  const allAppModules = import.meta.glob('./*.svelte')  
  
  const AppModule = Object.entries(allAppModules).find(
    ([key]) => key.includes(path)
  )[1]

</script>

{#await AppModule() then Mod}
    <Mod.default />
{/await}
