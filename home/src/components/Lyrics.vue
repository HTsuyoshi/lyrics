<script setup lang='ts'>
	import { ref, onMounted } from 'vue';
	import { Word, Line, get_random, easeOutCubic, easeOutQuint, colorTransition, color_1, color_2 } from '../lib/Lyrics.ts'

	// Arguments
	const props = defineProps({
		fullscreen: {
			type: Boolean,
			default: false,
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

	// Draw
	class Shape {
		ctx: CanvasRenderingContext2D;
		text: string;
		p: { x: number, y: number };
		font_size: number;

		constructor(text: string, ctx: CanvasRenderingContext2D) {
			this.ctx = ctx;
			this.text = text;
			this.pos = { x: 0, y: 0 };
			this.font_size = Math.min(win.w / 5, win.h / 5);
		}

		private draw_text(progress: number): void {
			this.ctx.font = `${this.font_size * easeOutQuint(progress)}px Arial`;
			const x = win.w2 - this.ctx.measureText(this.text).width/2;
			const y = win.h2 - this.ctx.measureText(this.text).width/2;

			this.ctx.save();
			this.ctx.translate(x, y);
			this.ctx.rotate(10 * easeOutQuint(progress) * Math.PI / 180);
			this.ctx.fillText(this.text, 0, 0);
			this.ctx.restore();

			this.ctx.font = `${this.font_size * easeOutQuint(progress - 0.01)}px Arial`;
			this.ctx.save();
			this.ctx.translate(x, y);
			this.ctx.rotate(10 * easeOutQuint(progress) * Math.PI / 180);
			this.ctx.fillStyle = color_1;
			this.ctx.fillText(this.text, 0, 0);
			this.ctx.restore();
		}

		private draw(progress: number): void {
			this.ctx.fillStyle = color_2;
			this.draw_text(progress);
		}

		public update(progress: number): void {
			this.font_size = Math.min(win.w / 5, win.h / 5);
			this.draw(progress);
		}
	}

	class Word {
		ctx: CanvasRenderingContext2D;
		text: string;
		p: { x: number, y: number };
		font_size: number;
		actual_font_size: number;
		off: number;
		invert: boolean;
		draw_style: {
			fill: boolen,
			outline: boolean,
			stroke_square: boolean,
			fill_square: booelan,
			rotate: boolean
		};
		draw_position: {
			stroke_square: number,
			fill_square: number,
			side: boolean
		};

		constructor(text: string, ctx: CanvasRenderingContext2D) {
			this.ctx = ctx;
			this.text = text;
			this.pos = { x: 0, y: 0 };
			this.font_size = Math.min(win.w / 10, win.h / 10);
			this.actual_font_size = 0;

			// Settings
			this.off = 3;
			this.invert = false;
			this.setup_word_style();
		}

		private setup_word_style(): void {
			this.draw_style = {
				fill: (Math.random() >= 0.5),
				outline: (Math.random() >= 0.5),
				stroke_square: (Math.random() >= 0.5),
				fill_square: (Math.random() >= 0.5),
				rotate: (Math.random() >= 0.5)
			};

			if (!this.draw_style.fill && !this.draw_style.outline)
				this.draw_style.fill = true;

			this.draw_position = {
				stroke_square: (this.draw_style.stroke_square ? get_random(0, this.text.length - 1) : -1),
				fill_square: (this.draw_style.fill_square ? get_random(0, this.text.length - 1) : -1),
				side: (get_random(0,1))
			};
		}

		public set_word(text: string): void {
			this.text = text;
			this.setup_word_style();
		}

		private draw_text(progress: number): void {
			let start_pos = - this.ctx.measureText(this.text).width/2;
			for (let i=0; i<this.text.length; ++i) {
				const c = this.text[i];
				const c_w = this.ctx.measureText(c).width;

				this.ctx.save();
				if (this.draw_style.rotate) {
					if (this.draw_position.side) {
						this.ctx.translate(win.w2 + start_pos, win.h2 - (i - this.text.length/2) * 10);
					} else {
						this.ctx.translate(win.w2 + start_pos, win.h2 + (i - this.text.length/2) * 10);
					}
				} else {
					this.ctx.translate(win.w2 + start_pos, win.h2 + Math.abs(i - this.text.length/2) * 5);
				}
				this.ctx.rotate((i - this.text.length/2) * 5 * progress * Math.PI / 180);
				if (this.draw_style.fill) {
					if (i === this.draw_position.fill_square) {
						this.ctx.fillRect(0, -this.actual_font_size * 0.8, this.actual_font_size * 0.9, this.actual_font_size * 0.9);
						this.ctx.fillStyle = color_1;
						this.ctx.fillText(c, 0, 0);
						this.ctx.fillStyle = color_2;
					} else {
						this.ctx.fillText(c, 0, 0);
					}
					if (i === this.draw_position.stroke_square) {
						this.ctx.strokeRect(0, -this.actual_font_size * 0.8, this.actual_font_size * 0.9, this.actual_font_size * 0.9);
					}
				}
				this.ctx.restore();

				this.ctx.save();
				if (this.draw_style.rotate) {
					if (this.draw_position.side) {
						this.ctx.translate(win.w2 + start_pos, win.h2 - (i - this.text.length/2) * 10);
					} else {
						this.ctx.translate(win.w2 + start_pos, win.h2 + (i - this.text.length/2) * 10);
					}
				} else {
					this.ctx.translate(win.w2 + start_pos, win.h2 + Math.abs(i - this.text.length/2) * 5);
				}
				this.ctx.rotate((i - this.text.length/2) * 5 * progress * Math.PI / 180);
				if (this.draw_style.outline) {
					this.ctx.strokeText(c, 0, 0);
				}
				this.ctx.restore();
				start_pos += c_w;
			}
		}

		private draw(progress: number): void {
			this.actual_font_size = this.font_size * progress;
			this.ctx.font = `${this.actual_font_size}px Arial`;
			this.ctx.fillStyle = color_2;
			this.ctx.strokeStyle = color_2;
			this.draw_text(progress);
		}

		public update(progress: number): void {
			this.font_size = Math.min(win.w / 10, win.h / 10);
			const ease_progress = easeOutQuint(progress);
			this.draw(ease_progress);
		}
	}

	class Line {
		p_1: { x: number, y: number };
		p_2: { x: number, y: number };
		d: { x: number, y: number };
		r: boolean; // vert or horz
		speed: number;
		ctx: CanvasRenderingContext2D;

		constructor(ctx: CanvasRenderingContext2D) {
			this.ctx = ctx;
			this.r = (Math.random() >= 0.5);
			this.new_points();
			this.new_direction();
			this.speed = 5;
		}

		private new_points(): void {
			this.p_1 = {
				x: (this.r ? get_random(0, win.w) : 0),
				y: (this.r ? 0 : get_random(0, win.h))
			};
			this.p_2 = {
				x: (this.r ? Math.random() * win.w : win.w),
				y: (this.r ? win.h : Math.random() * win.h)
			};
		}

		private new_direction(): void {
			this.d = {
				x: (Math.random() * 2) - 1,
				y: (Math.random() * 2) - 1
			};
		}

		private draw(progress: number): void {
			this.ctx.strokeStyle = colorTransition(progress);
			this.ctx.beginPath();
			this.ctx.moveTo(this.p_1.x, this.p_1.y);
			this.ctx.lineTo(this.p_2.x, this.p_2.y);
			this.ctx.stroke();
		}

		public update(progress): void {
			const ease_progress =  easeOutQuint(progress);
			const speed_x = this.speed * this.d.x * ease_progress;
			const speed_y = this.speed * this.d.y * ease_progress;
			if (this.r) {
				this.p_1.x += speed_x;
				this.p_2.x += speed_x;
			} else {
				this.p_1.y += speed_y;
				this.p_2.y += speed_y;
			}
			this.draw(ease_progress);
		}
	}

	class Scene {
		ctx: CanvasRenderingContext2D;
		progress: number;
		speed: number;
		lyrics_index: number;
		lyrics: string[];
		symbols: string[];
		word: Word;
		lines: Line[];
		shapes: Shape[];

		constructor(ctx: CanvasRenderingContext2D) {
			this.ctx = ctx;
			this.progress = 0.0;
			this.speed = 0.01;
			this.lyrics_index = 0;
			this.lyrics = [
				'',
				'どうでもいい',
				'ような',
				'夜だけど',
				'響めき',
				'煌めきと君も',
				'まだ止まった 刻む針も',
				'入り浸った 散らかる部屋も',
				'変わらないね 思い出しては',
				'二人 歳を重ねてた'
			];
			this.symbols = [ '🟄', '★', '🟆', '◉', '⚫', '■'];
			this.word = new Word(this.lyrics[this.lyrics_index], this.ctx, color_1, color_2);
			this.lines = [];
			this.shapes = [];
			this.next_word();
			this.reset_line();
			this.reset_shapes();
		}

		private next_word(): void {
			this.lyrics_index = (this.lyrics_index + 1) % this.lyrics.length;
			this.word.set_word(this.lyrics[this.lyrics_index], this.ctx);
		}

		private reset_line(): void {
			this.lines = [];
			for (let i=0; i<get_random(1,5); i++)
				this.lines.push(new Line(this.ctx));
		}

		private reset_shapes(): void {
			const symbol = this.symbols[get_random(0, this.symbols.length - 1)];
			this.shapes = [];
			for (let i=0; i<get_random(0,2); i++)
				this.shapes.push(new Shape(symbol, this.ctx));
		}

		private draw(progress: number): void {
			this.word.update(this.progress);
			for (let l of this.lines) l.update(this.progress);
			//for (let s of this.shapes) s.update(this.progress);
			this.progress += this.speed;
		}

		public update(): void {
			if (this.progress > 1.0) this.speed = - this.speed;
			if (this.progress < 0.0) {
				this.speed = - this.speed;
				this.next_word();
				this.reset_line();
				this.reset_shapes();
			}
			this.draw();
		}
	}

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

		const scene: Scene = new Scene(ctx);

		function draw_animation(): void {
			ctx.clearRect(0, 0, win.w, win.h);
			scene.update();
			requestAnimationFrame(draw_animation);
		}

		requestAnimationFrame(draw_animation);
	});
</script>

<template>
	<canvas ref='canvasRef'></canvas>
</template>
