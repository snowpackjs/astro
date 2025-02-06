<template>
	<div class="counter">
		<button @click="subtract()" class="decrement">-</button>
		<pre>{{prefix}}{{ count }}</pre>
		<button @click="add()" class="increment">+</button>
	</div>
	<div class="counter-message">
		<slot />
	</div>
</template>

<script lang="ts">
import { ref } from 'vue';
export default {
	props: {
		prefix: {
			type: String,
			default: '',
		},
	},
	setup() {
		const count = ref(0);
		const add = () => (count.value = count.value + 1);
		const subtract = () => (count.value = count.value - 1);

		return {
			count,
			add,
			subtract,
		};
	},
};
</script>

<style scoped>
.counter {
	display: grid;
	font-size: 2em;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	margin-top: 2em;
	place-items: center;
}

.counter-message {
	text-align: center;
	background: darkgreen;
	color: greenyellow;
}
</style>
