<template>
  <div class="counter">
    <h1><slot /></h1>
    <button @click="subtract()">-</button>
    <Result :value="count" />
    <button @click="add()">+</button>
  </div>
</template>

<script>
import { ref } from 'vue';

import Result from './Result.vue';

export default {
  components: {
    Result
  },
  props: {
    start: {
      type: String,
      required: true
    },
    stepSize: {
      type: String,
      default: "1"
    }
  },
  setup(props) {
    const count = ref(parseInt(props.start))
    const stepSize = ref(parseInt(props.stepSize))
    const add = () => (count.value = count.value + stepSize.value);
    const subtract = () => (count.value = count.value - stepSize.value);
    return {
      count,
      add,
      subtract,
    };
  },
};
</script>
