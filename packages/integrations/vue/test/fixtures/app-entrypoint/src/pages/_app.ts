import type { App } from 'vue'
import Bar from '../components/Bar.vue'

export default function setup(app: App) {
	app.component('Bar', Bar);
}
