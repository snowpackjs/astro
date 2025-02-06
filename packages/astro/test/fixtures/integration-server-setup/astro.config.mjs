import { defineConfig } from 'astro/config'
import test from './integration.js'

export default defineConfig({
	integrations: [test()]
})
