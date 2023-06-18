<script setup lang='ts'>
	import Button from '../components/Button.vue'
</script>

<template>
	<div id='background'>
		<h1>
			Lyrics visualization
		</h1>
		<div id='buttons'>
			<Button link='/lyrics/night_dancer' title='🌒 Night Dancer 🌒'></Button>
			<Button link='/lyrics/senbonzakura' title='❀ Senbonzakura ❀'></Button>
			<Button link='/lyrics/cupid' title='♥ Cupid ♥'></Button>
			<Button link='/lyrics/paranoia' title='☠ Paranoia ☠'></Button>
		</div>
	</div>
</template>

<style scoped>
#background {
	text-align: center;
}
#buttons {
	display: flex;
	flex-direction: column;
	justify-content: center;
}
h1 {
	color: #fff;
}
</style>;
