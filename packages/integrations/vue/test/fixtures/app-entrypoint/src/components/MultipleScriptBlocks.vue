<script lang="ts">
export const doubleNumber = (num: number) => num * 2
</script>

<script lang="ts" setup>
defineProps({
	value: {
		type: Number,
		required: true
	}
})
</script>

<template>
	<div id="multiple-script-blocks">
		{{ doubleNumber(value) }} <slot />
	</div>
</template>
