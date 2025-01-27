
export default {
	check() {
		return true;
	},
	renderToStaticMarkup(Component) {
		return {
			html: Component()
		};
	},
};
