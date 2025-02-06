<template>
  <div :id="id" class="counter">
    <button class="decrement" @click="subtract()">-</button>
		<pre>{{count}}</pre>
    <button class="increment" @click="add()">+</button>
  </div>
	<div :id="messageId" class="message">
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
		},
    count: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
		const id = props.id;
		const count = ref(props.count);
		const messageId = `${id}-message`;
    const add = () => (count.value = count.value + 1);
    const subtract = () => (count.value = count.value - 1);
    return {
      count,
			id,
			messageId,
      add,
      subtract,
    };
  },
};
</script>

<style>
  .counter {
    display: grid;
    font-size: 2em;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 2em;
    place-items: center;
  }
  .message {
    text-align: center;
  }
</style>
