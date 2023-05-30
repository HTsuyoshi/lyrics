// Constants
export const color_1: string = '#dadada';
export const color_2: string = '#1e1e2e';

// Essential functions
export function get_random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function get_boolean(): boolean {
	return (Math.random() >= 0.5);
}

export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}

export function easeOutQuint(x: number): number {
	return 1 - Math.pow(1 - x, 5);
}

export function colorTransition(x: number): string {
	const r1 = parseInt(color_1.substr(1, 2), 16);
	const g1 = parseInt(color_1.substr(3, 2), 16);
	const b1 = parseInt(color_1.substr(5, 2), 16);
	const r2 = parseInt(color_2.substr(1, 2), 16);
	const g2 = parseInt(color_2.substr(3, 2), 16);
	const b2 = parseInt(color_2.substr(5, 2), 16);

	const r = Math.round(r1 + (r2 - r1) * x);
	const g = Math.round(g1 + (g2 - g1) * x);
	const b = Math.round(b1 + (b2 - b1) * x);

	const hex = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;

	return hex;
}

// Draw
//export class Shape {
//	ctx: CanvasRenderingContext2D;
//	win: { w: number, w2: number, h: number, h2: number }
//	p: { x: number, y: number };
//
//	constructor(ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
//		this.ctx = ctx;
//		this.win = win
//
//		this.p = { x: 0, y: 0 };
//	}
//
//	private draw_circle(progress: number): void {
//	}
//
//	private draw(progress: number): void {
//		this.ctx.fillStyle = color_2;
//		this.ctx.fillStyle = color_1;
//		this.draw_text(progress);
//	}
//
//	public update(progress: number): void {
//		this.draw(progress);
//	}
//}

export class Word {
	ctx: CanvasRenderingContext2D;
	font_size: number;
	font: string;
	off: number;
	win: { w: number, w2: number, h: number, h2: number }

	text!: string;
	actual_font_size!: number;
	box_size!: number;
	box_gap!: number;
	draw_style!: {
		fill: boolean,
		outline: boolean,
		stroke_square: boolean,
		fill_square: boolean,
		rotate: boolean
	};
	draw_position!: {
		stroke_square: number,
		fill_square: number,
		side: number
	};

	constructor(font: string, text: string, ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;

		this.font = font;
		this.font_size = Math.min(this.win.w / 10, this.win.h / 10);
		this.set_word(text);

		// Settings
		this.off = 3;
	}

	public set_word(text: string): void {
		this.text = text;

		this.draw_style = {
			fill: get_boolean(),
			outline: get_boolean(),
			stroke_square: get_boolean(),
			fill_square: get_boolean(),
			rotate: get_boolean()
		};
		if (!(this.draw_style.fill && this.draw_style.outline)) this.draw_style.fill = true;

		this.draw_position = {
			stroke_square: this.draw_style.stroke_square ? get_random(0, this.text.length - 1) : -1,
			fill_square: this.draw_style.fill_square ? get_random(0, this.text.length - 1) : -1,
			side: get_boolean() ? 1 : -1
		};
	}

	private ctx_translate(x_off: number, y_off: number, progress: number, i: number): void {
		const x = this.win.w2 + x_off;
		const y = this.win.h2 + this.actual_font_size/4 + y_off;
		const effect = (1 - progress) * 10;
		if (!this.draw_style.rotate) {
			this.ctx.translate(x, y + Math.pow(Math.abs(i), 5) * effect * this.draw_position.side);
			return;
		}
		this.ctx.translate(x, y + i * effect * this.draw_position.side);
	}

	private draw_text(progress: number): void {
		let start_pos = - this.ctx.measureText(this.text).width/2;
		for (let i=0; i<this.text.length; ++i) {
			const c = this.text[i];

			this.ctx.save();
			this.ctx_translate(start_pos, 0, progress, i - this.text.length/2);
			//this.ctx.rotate(5 * (i - this.text.length/2) * progress * Math.PI / 180);
			if (this.draw_style.fill) {
				if (i === this.draw_position.fill_square) {
					this.ctx.fillRect(0, - this.box_gap, this.box_size, this.box_size);
					this.ctx.fillStyle = color_1;
					this.ctx.fillText(c, 0, 0);
					this.ctx.fillStyle = color_2;
				} else {
					this.ctx.fillText(c, 0, 0);
				}
				if (i === this.draw_position.stroke_square) {
					this.ctx.strokeRect(0, - this.box_gap, this.box_size, this.box_size);
				}
			}
			if (this.draw_style.outline) {
				this.ctx.strokeText(c, -this.off, -this.off);
			}
			this.ctx.restore();
			start_pos += this.ctx.measureText(c).width;
		}
	}

	private draw(progress: number): void {
		this.actual_font_size = this.font_size * progress;
		this.box_size = this.actual_font_size * 0.9;
		this.box_gap = this.actual_font_size * 0.8;
		this.ctx.font = `${this.actual_font_size}px ${this.font}`;
		this.draw_text(progress);
	}

	public update(progress: number): void {
		this.font_size = Math.min(this.win.w/10, this.win.h/10);
		const ease_progress = easeOutQuint(progress);
		this.draw(ease_progress);
	}
}

export class Line {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number }
	vel: number;
	r: boolean; // vert or horz
	p_1: { x: number, y: number };
	p_2: { x: number, y: number };

	constructor(ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;

		this.vel = ((Math.random() * 2) - 1);
		this.r = get_boolean();
		this.p_1 = {
			x: (this.r ? get_random(0, this.win.w) : 0),
			y: (this.r ? 0 : get_random(0, this.win.h))
		};
		this.p_2 = {
			x: (this.r ? Math.random() * this.win.w : this.win.w),
			y: (this.r ? this.win.h : Math.random() * this.win.h)
		};
	}

	private draw(progress: number): void {
		this.ctx.strokeStyle = colorTransition(progress * Math.abs(this.vel));
		this.ctx.beginPath();
		this.ctx.moveTo(this.p_1.x, this.p_1.y);
		this.ctx.lineTo(this.p_2.x, this.p_2.y);
		this.ctx.stroke();
	}

	public update(progress: number): void {
		const ease_progress = easeOutQuint(progress);
		const speed = 5 * this.vel * ease_progress;
		if (this.r) {
			this.p_1.x += speed;
			this.p_2.x += speed;
		} else {
			this.p_1.y += speed;
			this.p_2.y += speed;
		}
		this.draw(ease_progress);
	}
}

export class Background {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number }
	lines!: Line[];
	draw_style!: {
		lines: boolean,
		vertical: boolean
	};

	constructor(ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;

		this.reset_line();
		this.setup_style();
	}

	private setup_style(): void {
		this.draw_style = {
			lines: get_boolean(),
			vertical: get_boolean(),
		};
	}

	public reset(): void {
		this.setup_style();
		if (this.draw_style.lines) this.reset_line();
	}

	private reset_line(): void {
		this.lines = [];
		for (let i=0; i<get_random(1,8); i++)
			this.lines.push(new Line(this.ctx, this.win));
	}

	private draw_vertical(progress: number): void {
		const rect_size = easeOutCubic(progress) * this.win.h * 0.2;
		this.ctx.fillRect(0, 0, this.win.w, this.win.h);
		this.ctx.fillStyle = color_1;
		this.ctx.fillRect(0, this.win.h2 - rect_size/2, this.win.w, rect_size);
		this.ctx.fillStyle = color_2;
	}

	private draw(progress: number) {
		this.ctx.clearRect(0, 0, this.win.w, this.win.h);
		if (this.draw_style.vertical) {
			this.draw_vertical(progress);
		}
		if (this.draw_style.lines) {
			for (let l of this.lines) l.update(progress);
			this.ctx.strokeStyle = color_2;
		}
	}

	public update(progress: number) {
		this.draw(progress);
	}
}

type Lyric = {
	text: string,
	time: number
}

export class Scene {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number }
	progress: number;
	lyrics_index: number;
	lyrics: Lyric[];
	total_time: number;
	word: Word;
	background: Background;
	play: boolean;
	//shapes!: Shape[];

		
	constructor(font: string, lyrics: Lyric[],
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;
		this.ctx.fillStyle = color_2;
		this.ctx.strokeStyle = color_2;
		this.play = false;

		this.lyrics = lyrics;
		this.total_time = 0;
		for (let l of this.lyrics) this.total_time += l.time;
		this.progress = 0.0;
		this.lyrics_index = -1;
		this.word = new Word(font, this.lyrics[0].text, this.ctx, this.win);
		this.background = new Background(this.ctx, this.win);
		this.reset();
	}

	public start(): void {
		this.play = !this.play;
	}

	private next_word(): void {
		this.lyrics_index = (this.lyrics_index + 1) % this.lyrics.length;
		this.word.set_word(this.lyrics[this.lyrics_index].text);
	}

	//private reset_shapes(): void {
	//	this.shapes = [];
	//	for (let i=0; i<get_random(0,2); i++)
	//	this.shapes.push(new Shape(this.ctx, this.win));
	//}

	private reset(): void {
		this.background.reset();
		this.next_word();
		//this.reset_shapes();
	}

	private draw(): void {
		this.background.update(this.progress);
		//for (let s of this.shapes) s.update(this.progress);
		this.word.update(this.progress);
	}

	public update(time: number): void {
		if (!this.play) return;
		let time_gap = 0;
		for (let i=0; i<this.lyrics_index; ++i) {
			time_gap += this.lyrics[i].time;
		}

		const time_wait = this.lyrics[this.lyrics_index].time;
		const current_time = ((time - time_gap) % this.total_time)
		if (current_time > time_wait) {
			this.reset();
		} else {
			this.progress = (current_time * 2) / time_wait
			if (this.progress > 1) this.progress = 2 - this.progress;
		}
		this.draw();
	}
}
