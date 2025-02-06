<template>
  <pre>{{ value }}</pre>
  <my-button>Click Me</my-button>
</template>

<script>

export default {
  props: {
    value: {
      type: Number,
      required: true
    }
  }
}
</script>
