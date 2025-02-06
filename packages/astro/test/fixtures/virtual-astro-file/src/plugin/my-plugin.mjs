

export default function myPlugin() {
	const pluginId = `@my-plugin/virtual.astro`;
  return {
    enforce: 'pre',
    name: 'virtual-astro-plugin',
    resolveId(id) {
      if (id === pluginId) return id;
    },
    load(id) {
      if (id === pluginId) {
        return `---
const works = true;
---
<h1 id="something">This is a virtual module id</h1>
<h2 id="works">{works}</h2>
<style>
  h1 {
		color: green;
	}
</style>
`;
      }
    },
  };
}
