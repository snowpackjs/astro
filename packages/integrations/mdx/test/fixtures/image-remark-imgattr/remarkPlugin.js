export default function plugin() {
	return transformer;

	function transformer(tree) {
		function traverse(node) {
			if (node.type === "image") {
				node.data = node.data || {};
				node.data.hProperties = node.data.hProperties || {};
				node.data.hProperties.id = "test";
				node.data.hProperties.width = "300";
				node.data.hProperties.widths = [300,600];
				node.data.hProperties.sizes = "(min-width: 600px) 600w, 300w";
			}

			if (node.children) {
				node.children.forEach(traverse);
			}
		}

		traverse(tree);
	}
}
