<script setup lang='ts'>
	import Lyrics from '../components/Lyrics.vue'
	
	const lyric = [
			{ text: 'A', time: 1.0 },
			{ text: 'hopeless', time: 1.0 },
			{ text: 'romantic', time: 1.0 },
			{ text: 'all', time: 1.0 },
			{ text: 'my', time: 1.0 },
			{ text: 'life', time: 1.0 },
			{ text: 'Surrounded', time: 1.0 },
			{ text: 'by', time: 1.0 },
			{ text: 'couples', time: 1.0 },
			{ text: 'all', time: 1.0 },
			{ text: 'the', time: 1.0 },
			{ text: 'time', time: 1.0 },
			{ text: 'I', time: 1.0 },
			{ text: 'guess', time: 1.0 },
			{ text: 'I', time: 1.0 },
			{ text: 'should', time: 1.0 },
			{ text: 'take', time: 1.0 },
			{ text: 'it', time: 1.0 },
			{ text: 'as', time: 1.0 },
			{ text: 'a', time: 1.0 },
			{ text: 'sign', time: 1.0 },
			{ text: '(Ah, why? Ah, why? Ah, why? Ah, why?)', time: 1.0 },
	];

	const cupid = {
		lyrics: lyric,
		font: 'Noto Sans KR',
		color_background: '#eaeaea',
		colors: ['#222222', '#e9d397', '#e75b66', '#f0c1b7', '#f9a99e'],
		url: '/lyrics/audios/cupid.mp3'
	};
</script>

<template>
	<Lyrics :fullscreen='true' :lyrics='cupid.lyrics' :font='cupid.font' :color_background='cupid.color_background' :colors='cupid.colors' :url='cupid.url'></Lyrics>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR&display=swap');
</style>
