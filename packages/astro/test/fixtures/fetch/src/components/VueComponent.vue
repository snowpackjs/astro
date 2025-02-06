<template>
  <span id="vue">{{ type }}</span>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return {
      type: typeof fetch
    }
  }
})
</script>

