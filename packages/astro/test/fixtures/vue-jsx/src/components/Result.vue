<template>
  <pre>{{ value }}</pre>
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
