<script setup lang='ts'>
	import Lyrics from '../components/Lyrics.vue'
	
	const lyric = [
			{ text: 'asdf', time: 1.0 },
			{ text: 'asdf', time: 1.0 },
			{ text: 'asdf', time: 0.5 },
			{ text: 'asdf', time: 2.0 },
			{ text: 'asdf', time: 3.0 },
			{ text: 'asdf', time: 0.5 },
			{ text: 'asdf', time: 0.5 },
			{ text: 'asdf', time: 0.5 },
			{ text: 'asdf', time: 0.5 },
			{ text: 'asdf', time: 2.0 },
			{ text: 'asdf', time: 3.0 }
	];
	
	const paranoia = {
		lyrics: lyric,
		font: 'Noto Serif JP',
		color_background: '#eaeaea',
		colors: ['#e6007d', '#222222'],
		url: 'audios/night_dancer.mp3'
		//url: 'paranoia.mp3'
	};
</script>

<template>
	<Lyrics :fullscreen='true' :lyrics='paranoia.lyrics' :font='paranoia.font' :color_background='paranoia.color_background' :colors='paranoia.colors' :url='paranoia.url'></Lyrics>
</template>
