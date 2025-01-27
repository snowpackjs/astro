<script setup>
import { useId } from "vue"

const id = useId()
</script>

<template>
    <p class="vue-use-id" :id="id">{{ id }}</p>
</template>