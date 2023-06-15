<script setup lang='ts'>
	defineProps({
		title: {
			type: String,
			required: true
		},
		link: {
			type: String,
			required: true
		}
	});
</script>

<template>
	<router-link :to='link' >
	<button>{{ title }}</button>
	</router-link>
</template>

<style scoped>
button {
	min-width: 16em;
	min-height: 4em;
	border: 1px solid #fff;
	background-color: transparent;
	color: #fff;
	padding: 1em;
	margin: 1em;
}
</style>
