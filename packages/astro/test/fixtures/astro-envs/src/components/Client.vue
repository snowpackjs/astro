<template>
  <div id="client-component">
    {{ PUBLIC_PLACE }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      PUBLIC_PLACE: import.meta.env.PUBLIC_PLACE,
			SECRET_PLACE: import.meta.env.SECRET_PLACE,
			BASE_URL: import.meta.env.BASE_URL,
    };
  },
};
</script>
