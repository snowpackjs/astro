export default function plugin() {
	return transformer;

	function transformer(tree) {
		function traverse(node) {
			if (node.type === "image") {
				node.data = node.data || {};
				node.data.hProperties = node.data.hProperties || {};
				node.data.hProperties.loading = "eager";
				node.data.hProperties.width = "50";
			}

			if (node.children) {
				node.children.forEach(traverse);
			}
		}

		traverse(tree);
	}
}
