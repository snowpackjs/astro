<script lang="ts">
export const customFormatter = (num: number) => `${num * 3}!!!`

export type FormatNumber<T> = (num: T) => string;
</script>

<script lang="ts" setup generic="T extends number, Formatter extends FormatNumber<T>">
const props = defineProps<{
	value: T,
	formatter: Formatter
}>()
</script>

<template>
	<div id="generics-and-blocks">
		{{ value }} {{ props.formatter(props.value) }}
	</div>
</template>
