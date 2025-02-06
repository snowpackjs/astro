<template>
  <div class="counter">
    <button @click="subtract()">-</button>
    <pre>{{ count }}</pre>
    <button @click="add()">+</button>
  </div>
  <div :id="case" class="counter-message">
    <slot>
      <h1>Fallback</h1>
    </slot>
		<slot name="named" />
		<slot name="dash-case"></slot>
  </div>
</template>

<script>
import { ref } from 'vue';
export default {
  props: {
    case: String,
  },
  setup(props) {
    const count = ref(0);
    const add = () => (count.value = count.value + 1);
    const subtract = () => (count.value = count.value - 1);

    return {
      case: props.case,
      count,
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
.counter-message {
  text-align: center;
}
</style>
