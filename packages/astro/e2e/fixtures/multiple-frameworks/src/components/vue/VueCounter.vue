<template>
	<div :id="id" class="counter">
		<button class="decrement" @click="subtract()">-</button>
		<pre>{{ count }}</pre>
		<button class="increment" @click="add()">+</button>
	</div>
	<div class="counter-message">
		<slot />
	</div>
</template>

<script>
import { ref } from 'vue';
export default {
	props: {
		id: {
			type: String,
			required: true
		}
  },
	setup(props) {
		const count = ref(0);
		const add = () => (count.value = count.value + 1);
		const subtract = () => (count.value = count.value - 1);

		return {
			id: props.id,
			count,
			add,
			subtract,
		};
	},
};
</script>
