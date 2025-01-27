import { defineToolbarApp } from 'astro/toolbar';

// Guide: https://docs.astro.build/en/recipes/making-toolbar-apps/
// API Reference: https://docs.astro.build/en/reference/dev-toolbar-app-reference/
export default defineToolbarApp({
	init(canvas) {
		const astroWindow = document.createElement('astro-dev-toolbar-window');

		const text = document.createElement('p');
		text.textContent = 'Hello, Astro!';

		astroWindow.append(text);

		canvas.append(astroWindow);
	},
});
