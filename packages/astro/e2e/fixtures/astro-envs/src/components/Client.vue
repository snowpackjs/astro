<template>
    <div id="client-component-base-url">{{ BASE_URL }}</div>
</template>

<script>
export default {
  data() {
    return {
			BASE_URL: import.meta.env.BASE_URL,
    };
  },
};
</script>
