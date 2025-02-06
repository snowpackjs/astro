<script lang="ts" setup generic="T extends 'generic' | 'not-generic'">
interface GenericComponentProps {
	value: T
}

defineProps<GenericComponentProps>()
</script>

<template>
	<div id="generics">
		{{ value }}
	</div>
</template>
