<template>
  <div :id="id" class="counter">
    <button class="decrement" @click="subtract()">-</button>
		<pre>{{count}}</pre>
    <button class="increment" @click="add()">+</button>
  </div>
</template>

<script setup>
	import { ref } from 'vue';

	const count = ref(0);
	const add = () => (count.value = count.value + 1);
	const subtract = () => (count.value = count.value - 1);
</script>
