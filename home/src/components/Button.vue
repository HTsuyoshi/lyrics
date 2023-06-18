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
			{{ title }}
	</router-link>
</template>

<style scoped>
a {
	text-decoration: none;
	min-width: 16em;
	min-height: 4em;
	border: 1px solid #fff;
	background-color: transparent;
	color: #fff;
	padding: 1em;
	margin: 1em;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: background-color .5s, color .5s;
}
a:hover {
	background-color: #fff;
	color: var(--background);
}
</style>
