// Essential functions
export function get_random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function get_boolean(): boolean {
	return (Math.random() >= 0.5);
}

export function easeOutN(x: number, n: number): number {
	return 1 - Math.pow(1 - x, n);
}

export function easeOutCubic(x: number): number {
	return 1 - Math.pow(1 - x, 3);
}

export function easeOutQuint(x: number): number {
	return 1 - Math.pow(1 - x, 5);
}

export function colorTransition(x: number, c_1: string, c_2: string): string {
	const r1 = parseInt(c_1.substr(1, 2), 16);
	const g1 = parseInt(c_1.substr(3, 2), 16);
	const b1 = parseInt(c_1.substr(5, 2), 16);
	const r2 = parseInt(c_2.substr(1, 2), 16);
	const g2 = parseInt(c_2.substr(3, 2), 16);
	const b2 = parseInt(c_2.substr(5, 2), 16);

	const r = Math.round(r1 + (r2 - r1) * x);
	const g = Math.round(g1 + (g2 - g1) * x);
	const b = Math.round(b1 + (b2 - b1) * x);

	const hex = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;

	return hex;
}

function draw_circle(ctx: CanvasRenderingContext2D, progress: number, size: number): void {
	ctx.beginPath();
	ctx.arc(0, 0, size/2 * progress, 0, Math.PI * 2);
	ctx.stroke();
}

function draw_square(ctx: CanvasRenderingContext2D, progress: number, size: number): void {
	const size_1 = size * progress;
	const size_2 = size/2;
	ctx.strokeRect(-size_2, -size_2, size_1, size_1);
}

function draw_triangle(ctx: CanvasRenderingContext2D, progress: number, size: number): void {
	const size_1 = size * progress;
	const size_2 = size_1/2;
	const size_sqrt_33 = size_1 * Math.sqrt(3)/6;
	ctx.beginPath();
	ctx.moveTo(      0,  -size_sqrt_33 * 2);
	ctx.lineTo( size_2,   size_sqrt_33);
	ctx.lineTo(-size_2,   size_sqrt_33);
	ctx.lineTo(      0,  -size_sqrt_33 * 2);
	ctx.lineTo( size_2,   size_sqrt_33);
	ctx.stroke();
}

// Draw
export class Shape {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number }
	color: {
		background: string,
		colors: string[]
	};
	format: number;
	rotate: number;
	size: number;
	p: { x: number, y: number };
	d: { x: boolean, y: boolean};
	distance: { x: number, y: number };
	speed: number;

	constructor(color: { background: string, colors: string[] },
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number },
				invert_y: boolean) {
		this.ctx = ctx;
		this.win = win
		this.color = color;

		this.format = get_random(0, 2);
		this.rotate = Math.random() * 2 + 1.0;
		this.size = (Math.random() * this.win.w/10) + this.win.w/10;
		this.p = { x: this.win.w2, y: this.win.h2 };
		this.d = { x: get_boolean(), y: invert_y };
		this.distance = { x: get_random(this.win.w2/4, this.win.w2), y: get_random(this.win.h2/2, this.win.h2*3/4) };
		this.speed = get_random(2, 5);
	}

	private _draw(progress: number): void {
		let shape_function = draw_circle;
		if (this.format === 1) shape_function = draw_square;
		else if (this.format === 2) shape_function = draw_triangle;
		
		let progress_inverse = progress;
		if (progress > 1) progress_inverse = 2 - progress;

		this.ctx.save()
		this.ctx.translate(this.p.x, this.p.y);
		this.ctx.rotate(this.rotate * progress/2 * Math.PI);
		this.ctx.lineWidth = 10 * easeOutQuint(progress_inverse);
		shape_function(this.ctx, easeOutQuint(progress_inverse), this.size);
		this.ctx.restore()
	}

	private _update_pos(progress: number): void {
		this.p.x = this.win.w2
				+ (this.d.x ? -1 : 1) * this.win.w2/5 * Math.sin(easeOutN(progress/2, this.speed) * Math.PI)
				+ (this.d.x ? -1 : 1) * this.distance.x/2
				+ (this.d.x ? 1 : -1) * this.distance.x * easeOutN(progress/2, this.speed);
		this.p.y = this.win.h2
				+ (this.d.y ? -1 : 1) * this.distance.y * easeOutN((progress > 1) ? 2 - progress : progress, this.speed);
	}

	public update(progress: number): void {
		this._update_pos(progress);
		this._draw(progress);
	}
}

enum WORD_STYLE {
	DEFAULT,
	OUTLINE
}

export class Word {
	ctx: CanvasRenderingContext2D;
	font_size: number;
	font: string;
	off: number;
	win: { w: number, w2: number, h: number, h2: number };
	color: { background: string, colors: string[] };

	text!: string;
	actual_font_size!: number;
	square!: {
		yi: number,
		yf: number,
	};
	draw_style!: {
		// Outline
		side: number,
		// Default
		character: {
			fill: boolean,
			outline: boolean,
		},
		stroke_square: number,
		fill_square: number,
		style: WORD_STYLE,
	};

	constructor(font: string, text: string,
				color: { background: string, colors: string[] },
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;
		this.color = color;

		this.font = font;
		this.font_size = this.win.w / 10;
		this.set_word(text);

		// Settings
		this.off = 3;
	}

	public set_word(text: string): void {
		this.text = text;

		const draw_style_length: number = Object.keys(WORD_STYLE)
			.filter(key => !isNaN(parseInt(key)))
			.map(key => parseInt(key)).length;

		this.draw_style = {
			side: get_boolean() ? 1 : -1,
			character: {
				fill: get_boolean(),
				outline: get_boolean(),
			},
			stroke_square: get_random(-1, this.text.length - 1),
			fill_square: get_random(-1, this.text.length - 1),
			style: get_random(0, draw_style_length - 1)
		};

		if (!(this.draw_style.character.fill && this.draw_style.character.outline)) this.draw_style.character.fill = true;

		this.square = {
			yi: 0,
			yf: 0
		}
	}

	public can_shape() {
		switch(this.draw_style.style) {
			case WORD_STYLE.DEFAULT:
				return true;
			case WORD_STYLE.OUTLINE:
				return false;
		}
	}

	public can_line() {
		switch(this.draw_style.style) {
			case WORD_STYLE.DEFAULT:
				return true;
			case WORD_STYLE.OUTLINE:
				return false;
		}
	}

	public can_background() {
		switch(this.draw_style.style) {
			case WORD_STYLE.DEFAULT:
				return true;
			case WORD_STYLE.OUTLINE:
				return false;
		}
	}

	private _draw_text_default(): void {
		let pos = {
			x: - this.ctx.measureText(this.text).width/2,
			y: this.actual_font_size/4
		}
		if (this.draw_style.character.fill) {
			this.ctx.fillText(this.text, pos.x, pos.y);
		}
		if (this.draw_style.character.outline) {
			this.ctx.strokeText(this.text, pos.x - 3, pos.y - 3);
		}
		if (this.draw_style.stroke_square !== -1) {
			let text_off = this.ctx.measureText(this.text.substring(0, this.draw_style.stroke_square)).width;
			const char_width = this.ctx.measureText(this.text[this.draw_style.stroke_square]).width;
			this.ctx.strokeRect(pos.x + text_off, pos.y - this.square.yi, char_width, this.square.yf);
		}
		if (this.draw_style.fill_square !== -1) {
			let text_off = this.ctx.measureText(this.text.substring(0, this.draw_style.fill_square)).width;
			const char_width = this.ctx.measureText(this.text[this.draw_style.fill_square]).width;
			this.ctx.fillRect(pos.x + text_off, pos.y - this.square.yi, char_width, this.square.yf);
			this.ctx.fillStyle = this.color.background;
			this.ctx.fillText(this.text[this.draw_style.fill_square], pos.x + text_off, pos.y);
			this.ctx.fillStyle = this.color.colors[0];
		}
	}

	private _draw_text_1(progress: number): void {
		let pos = {
			x: - this.ctx.measureText(this.text).width/2,
			y: this.actual_font_size/4
		}
		for (let i=-2; i<=2; ++i) {
			this.ctx.strokeText(this.text, pos.x + i * (this.win.w/10), pos.y + i * (this.win.h/10) * this.draw_style.side);
		}
		const i = Math.floor(progress*2.5) - 2;
		this.ctx.fillText(this.text, pos.x + i * (this.win.w/10), pos.y + i * (this.win.h/10) * this.draw_style.side);
	}

	private _draw(progress: number): void {
		const ease_progress = easeOutQuint(progress);
		const progress_inverse = (progress > 1) ? 2 - ease_progress : ease_progress;

		this.ctx.save();
		this.ctx.translate(this.win.w2, this.win.h2);
		switch (this.draw_style.style) {
			case WORD_STYLE.DEFAULT: {
				this.actual_font_size = this.font_size * progress_inverse;
				this.square.yf = this.actual_font_size * 0.9;
				this.square.yi = this.actual_font_size * 0.8;
				this.ctx.font = `${this.actual_font_size}px ${this.font}`;
				this._draw_text_default();
				break;
			}
			case WORD_STYLE.OUTLINE : {
				this.actual_font_size = this.font_size;
				this.ctx.font = `${this.actual_font_size}px ${this.font}`;
				this._draw_text_1(progress);
				break;
			}
		}
		this.ctx.restore();
	}

	public update(progress: number): void {
		this.font_size = Math.min(this.win.w/10, this.win.h/10);
		this._draw(progress);
	}
}

export class Line {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number };
	color: { background: string, colors: string[] };
	vel: number;
	r: boolean; // vert or horz
	p_1: { x: number, y: number };
	p_2: { x: number, y: number };

	constructor(color: { background: string, colors: string[] },
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;
		this.color = color;

		this.vel = (Math.random() * 2) - 1; // -1 to 1
		this.r = get_boolean(); // line horizontal or vertical
		this.p_1 = {
			x: (this.r ? get_random(0, this.win.w) : 0),
			y: (this.r ? 0 : get_random(0, this.win.h))
		};
		this.p_2 = {
			x: (this.r ? Math.random() * this.win.w : this.win.w),
			y: (this.r ? this.win.h : Math.random() * this.win.h)
		};
	}

	private _draw(progress: number): void {
		this.ctx.strokeStyle = colorTransition((progress/2) * Math.abs(this.vel), this.color.background, this.color.colors[0]);
		this.ctx.beginPath();
		this.ctx.moveTo(this.p_1.x, this.p_1.y);
		this.ctx.lineTo(this.p_2.x, this.p_2.y);
		this.ctx.stroke();
		this.ctx.strokeStyle = this.color.colors[0];
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
		this._draw(ease_progress);
	}
}

export class Background {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number };
	color: {
		background: string;
		colors: string[];
	}
	draw_style!: number;

	constructor(color:{ background: string, colors: string[] }, ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;

		this.color = color;
		this._setup_style();
	}

	private _setup_style(): void {
		this.draw_style = (Math.random() < 0.8) ? 0 : get_random(1, 1);
	}

	public reset(): void {
		this._setup_style();
	}

	private _draw_vertical(progress_inverse: number): void {
		const rect_size = easeOutCubic(progress_inverse) * this.win.h * 0.2;
		this.color.colors[0];
		this.ctx.fillRect(0, 0, this.win.w, this.win.h2 - rect_size/2);
		this.ctx.fillRect(0, this.win.h2 + rect_size/2,
						this.win.w, this.win.h2 - rect_size/2);
	}

	private _draw(progress: number) {
		let progress_inverse = progress;
		if (progress > 1) progress_inverse = 2 - progress;
		if (this.draw_style == 1)
			this._draw_vertical(progress_inverse);
	}

	public update(progress: number) {
		this._draw(progress);
	}
}

type Lyric = {
	text: string,
	time: number
}

export class Scene {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number }
	lyrics: {
		lyrics: Lyric[],
		index: number,
		total_time: number
	};
	options: {
		progress: number,
		play: boolean,
		color: {
			background: string;
			colors: string[];
		}
	};
	render: {
		word: Word,
		background: Background;
		lines: Line[],
		shapes: Shape[],
	};

		
	constructor(font: string, lyrics: Lyric[],
				color_background: string, colors: string[],
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
		this.ctx = ctx;
		this.win = win;
		this.options = {
			progress: 0.0,
			play: false,
			color: {
				background: color_background,
				colors: colors
			}
		};
		this._set_color_style();

		let total_time = 0;
		for (let l of lyrics) total_time += l.time;
		this.lyrics = {
			lyrics: lyrics,
			index: -1,
			total_time: total_time
		};

		this.render = {
			word: new Word(font,
						   this.lyrics.lyrics[0].text,
						   this.options.color,
						   this.ctx,
						   this.win),
			background: new Background(this.options.color,
									   this.ctx,
									   this.win),
			lines: [],
			shapes: []
		};
		this._reset();
	}

	public start(): void {
		this.options.play = !this.options.play;
	}

	private _next_word(): void {
		this.lyrics.index = (this.lyrics.index + 1) % this.lyrics.lyrics.length;
		this.render.word.set_word(this.lyrics.lyrics[this.lyrics.index].text);
	}

	private _reset_lines(): void {
		this.render.lines = [];
		if (get_boolean()) return;
		for (let i=0; i<get_random(1,8); i++)
			this.render.lines.push(new Line(this.options.color,
											this.ctx,
											this.win));
	}

	private _reset_shapes(): void {
		this.render.shapes = [];
		if (get_boolean()) return;
		let invert = get_boolean();
		for (let i=0; i<get_random(0,2); i++) {
			invert = !invert;
			this.render.shapes.push(new Shape(this.options.color,
											  this.ctx,
											  this.win,
											  invert));
		}
	}

	private _invert_color(): void {
		const tmp = this.options.color.background;
		this.options.color.background = this.options.color.colors[0];
		this.options.color.colors[0] = tmp;
	}

	private _reset(): void {
		if (Math.random() > 0.8) this._invert_color();
		this.render.background.reset();
		this._next_word();
		this._reset_lines();
		this._reset_shapes();
	}

	private _set_color_style(): void {
		this.ctx.fillStyle = this.options.color.colors[0];
		this.ctx.strokeStyle = this.options.color.colors[0];
	}

	private _draw(): void {
		this.ctx.fillStyle = this.options.color.background;
		this.ctx.fillRect(0, 0, this.win.w, this.win.h);
		this._set_color_style();
		if (this.render.word.can_line()) for (let l of this.render.lines) l.update(this.options.progress);
		if (this.render.word.can_shape()) for (let s of this.render.shapes) s.update(this.options.progress);
		this.render.word.update(this.options.progress);
		if (this.render.word.can_background()) this.render.background.update(this.options.progress);
	}

	public update(time: number): void {
		if (!this.options.play) return;
		let time_gap = 0;
		for (let i=0; i<this.lyrics.index; ++i) {
			time_gap += this.lyrics.lyrics[i].time;
		}

		const time_wait = this.lyrics.lyrics[this.lyrics.index].time;
		const current_time = ((time - time_gap) % this.lyrics.total_time)
		if (current_time > time_wait) {
			this._reset();
		} else {
			this.options.progress = (current_time * 2) / time_wait;
		}
		this._draw();
	}
}
