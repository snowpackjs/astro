export default (parentElement: HTMLElement) =>

	async (
		Component: any,
		props: Record<string, any>,
		//{ default: children, ...slotted }: Record<string, any>,
		//{ client }: Record<string, string>,
	) => {

		// in a real-world scenario, this would be a more complex function
		// actually rendering the components return value (which might be an AST/VDOM)

		const vdom = Component(props);

		const node: Node = document.createElement(vdom.tag);
		node.textContent = `${vdom.text} (rendered by client.ts)`;
		parentElement.appendChild(node);

		// cleanup
		parentElement.addEventListener('astro:unmount', () => {
			if (node.parentNode) {
				node.parentNode.removeChild(node);
			}
    }, { once: true });
	};