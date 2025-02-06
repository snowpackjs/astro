<template>
  <div :id="id">Framework client:only component</div>
</template>

<script>

export default {
  props: {
    id: {
      type: String,
      required: true
    }
  }
}
</script>
