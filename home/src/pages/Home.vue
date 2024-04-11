<script setup lang='ts'>
	import Button from '../components/Button.vue'
</script>

<template>
	<div id='background'>
		<h1>
			Lyrics visualization
		</h1>
		<div id='buttons'>
			<Button link='/night_dancer' title='Night Dancer (ナイトダンサー)'></Button>
			<Button link='/senbonzakura' title='Senbonzakura (千本桜)'></Button>
			<Button link='/cupid' title='Cupid'></Button>
			<Button link='/paranoia' title='Paranoia (パラノイア)'></Button>

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
