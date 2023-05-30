<script setup lang='ts'>
	import Lyrics from '../components/Lyrics.vue'
	
	const lyric = [
			{ text: '息が', time: 1.0 },
			{ text: 'どう', time: 1.0 },
			{ text: 'でもいい', time: 0.5 },
			{ text: 'ような夜だけど', time: 2.0 },
			{ text: '響めき煌めきと', time: 3.0 },
			{ text: '君も', time: 0.5 },
			{ text: '踊ろう', time: 0.5 },
			{ text: 'どう', time: 0.5 },
			{ text: 'でもいい', time: 0.5 },
			{ text: 'ような夜だけど', time: 2.0 },
			{ text: '二人刻もう', time: 3.0 }
	];
	
	const cupid = {
		lyrics: lyric,
		font: 'Arial',
		url: '/lyrics/audios/cupid.mp3'
	};
</script>

<template>
	<Lyrics :fullscreen='true' :lyrics='cupid.lyrics' :font='cupid.font' :url='cupid.url'></Lyrics>
</template>
