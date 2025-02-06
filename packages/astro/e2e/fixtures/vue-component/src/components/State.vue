<script setup>
import { ref } from 'vue'
const props = defineProps(['id'])
const count = ref(1)
</script>

<template>
  <span :id="props.id">Count is {{ count }}</span>
</template>
