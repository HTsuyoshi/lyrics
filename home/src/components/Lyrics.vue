<script setup lang='ts'>
	import { ref, onMounted } from 'vue';
	import { onBeforeRouteLeave } from 'vue-router';
	import { Scene, color_1 } from '../lib/Lyrics.ts'

	type Lyric = {
		text: string;
		time: number;
	};

	// Arguments
	const props = defineProps({
		fullscreen: {
			type: Boolean,
			default: true,
		},
		width: {
			type: Number,
			default: 300,
			validator: (value: number) => Number.isInteger(value)
		},
		height: {
			type: Number,
			default: 400,
			validator: (value: number) => Number.isInteger(value)
		},
		lyrics: {
			type: Array<Lyric>,
			required: true
		},
		font: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		}
	});

	// Refs
	const canvasRef = ref<HTMLCanvasElement | null>(null);

	// Variables
	let win = {
		w: 300,
		w2: 150,
		h: 400,
		h2: 200
	}

	if (props.fullscreen) {
		win.w = window.innerWidth;
		win.w2 = window.innerWidth/2;
		win.h = window.innerHeight;
		win.h2 = window.innerHeight/2;
	} else {
		win.w = props.width;
		win.w2 = props.width/2;
		win.h = props.height;
		win.h2 = props.height/2;
	}

	let scene: Scene;
	const audio = new Audio(props.url);
	audio.volume = 0.1;
	function start(): void {
		if (audio.paused) audio.play();
		else audio.pause();

		scene.start();
	}

	onBeforeRouteLeave((_to, _from, next) => {
		if (audio) {
			audio.pause();
		}
		next();
	});

	onMounted(() => {
		const canvas = canvasRef.value;
		if (!canvas) throw new Error('Canvas not found');
		const context = canvas.getContext('2d');
		if (!context) return;

		const ctx = context;

		canvas.width  = win.w;
		canvas.height = win.h;

		canvas.style.background = color_1;

		// Events
		if (props.fullscreen) {
			window.addEventListener (
				'resize',
				function () {
					win.w = window.innerWidth;
					win.w2 = window.innerWidth/2;
					win.h = window.innerHeight;
					win.h2 = window.innerHeight/2;
					ctx.canvas.width  = win.w;
					ctx.canvas.height = win.h;
				}
			)
		}

		scene = new Scene(props.font, props.lyrics, ctx, win);

		function draw_animation(): void {
			scene.update(audio.currentTime);
			requestAnimationFrame(draw_animation);
		}

		requestAnimationFrame(draw_animation);
	});
</script>

<template>
	<canvas @click='start' ref='canvasRef'></canvas>
</template>
