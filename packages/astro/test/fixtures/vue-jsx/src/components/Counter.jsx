import { defineComponent, ref } from 'vue';

export default defineComponent({
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
    return () => (
      <div class="counter">
        <h1><slot /></h1>
        <button onClick={subtract}>-</button>
        <pre>{count.value}</pre>
        <button onClick={add}>+</button>
      </div>
    )
  },
})
