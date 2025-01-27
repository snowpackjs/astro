
export default {
	check() {
		throw new Error(`Oops this did not work`);
	},
	renderToStaticMarkup(Component) {
		return {
			html: Component()
		};
	},
};
