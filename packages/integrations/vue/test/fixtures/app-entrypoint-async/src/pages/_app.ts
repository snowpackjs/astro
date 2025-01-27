import type { App } from 'vue'
import Bar from '../components/Bar.vue'
import Baz from '../components/Baz.vue'

export default async function setup(app: App) {
	app.component('Bar', Bar);

	await new Promise(resolve => setTimeout(resolve, 250));

	app.component('Baz', Baz);
}
