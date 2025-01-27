import { defineDb } from 'astro:db';
import { menu } from './shared';

export default defineDb({
	tables: {
		menu,
	},
});
