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
					this.rotate = Math.random() * 1.0 + 1.0;
					this.size = (Math.random() * this.win.w/20) + this.win.w/10;
					this.p = { x: this.win.w2, y: this.win.h2 };
					this.d = { x: get_boolean(), y: invert_y };
					this.distance = { x: get_random(this.win.w2, this.win.w*3/4), y: get_random(this.win.h2/2, this.win.h2*3/4) };
					this.speed = get_random(2, 5);
				}

				private _draw(progress: number, progress_inverse_quint: number): void {
					let shape_function = draw_circle;
					if (this.format === 1) shape_function = draw_square;
					else if (this.format === 2) shape_function = draw_triangle;

					this.ctx.save()
					this.ctx.translate(this.p.x, this.p.y);
					this.ctx.rotate(this.rotate * progress * Math.PI);
					this.ctx.lineWidth = 10 * progress_inverse_quint;
					shape_function(this.ctx, progress_inverse_quint, this.size);
					this.ctx.restore()
				}

				private _update_pos(progress: number, progress_inverse: number): void {
					this.p.x = this.win.w2
					+ (this.d.x ? -1 : 1) * this.win.w2/5 * Math.sin(easeOutN(progress, this.speed) * Math.PI)
					+ (this.d.x ? -1 : 1) * this.distance.x/2
					+ (this.d.x ? 1 : -1) * this.distance.x * easeOutN(progress, this.speed);
					this.p.y = this.win.h2
					+ (this.d.y ? -1 : 1) * this.distance.y * easeOutN(progress_inverse, this.speed);
				}

				public update(progress: number, progress_inverse: number, progress_inverse_quint: number): void {
					this._update_pos(progress, progress_inverse);
					this._draw(progress, progress_inverse_quint);
				}
}

enum WORD_STYLE {
	DEFAULT,
	OUTLINE,
	BACKGROUND
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
		// Style
		style: WORD_STYLE,
	};

	constructor(font: string, text: string, style: WORD_STYLE,
				color: { background: string, colors: string[] },
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
					this.ctx = ctx;
					this.win = win;
					this.color = color;

					this.font = font;
					this.font_size = this.win.w / 14;
					this.set_word(text, style);

					// Settings
					this.off = 3;
				}

				public set_word(text: string, style: WORD_STYLE): void {
					this.text = text;

					if (style == WORD_STYLE.DEFAULT ||
						style == WORD_STYLE.BACKGROUND) {
						this.draw_style = {
							character: {
								fill: get_boolean(),
								outline: get_boolean(),
							},
							stroke_square: get_random(-1, this.text.length - 1),
							fill_square: get_random(-1, this.text.length - 1),
							side: 0,
							style: style
						}
						if (!(this.draw_style.character.fill && this.draw_style.character.outline)) this.draw_style.character.fill = true;
						this.square = { yi: 0, yf: 0 }
					} else if (WORD_STYLE.OUTLINE) {
						this.draw_style = {
							character: {
								fill: false,
								outline: false,
							},
							stroke_square: -1,
							fill_square: -1,
							side: get_random(-1, 1),
							style: style
						}
						if (this.ctx.measureText(this.text).width > this.font_size) {
							this.draw_style.side = 0;
						}
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
						const c = this.text[this.draw_style.stroke_square];
						if (c !== ' ') {
							let text_off = this.ctx.measureText(this.text.substring(0, this.draw_style.stroke_square)).width;
							const char_width = this.ctx.measureText(c).width;
							this.ctx.strokeRect(pos.x + text_off, pos.y - this.square.yi, char_width, this.square.yf);
						}
					}
					if (this.draw_style.fill_square !== -1) {
						const c = this.text[this.draw_style.fill_square];
						if (c !== ' ') {
							let text_off = this.ctx.measureText(this.text.substring(0, this.draw_style.fill_square)).width;
							const char_width = this.ctx.measureText(c).width;
							this.ctx.fillRect(pos.x + text_off, pos.y - this.square.yi, char_width, this.square.yf);
							this.ctx.fillStyle = this.color.background;
							this.ctx.fillText(this.text[this.draw_style.fill_square], pos.x + text_off, pos.y);

							this.ctx.fillStyle = this.color.colors[0];
						}
					}
				}

				private _draw_text_1(progress_step: number): void {
					let pos = {
						x: - this.ctx.measureText(this.text).width/2,
						y: this.actual_font_size/4
					}
					for (let i=-2; i<=2; ++i) {
						this.ctx.strokeText(this.text, pos.x + i * (this.font_size) * this.draw_style.side, pos.y + i * (this.font_size));
					}
					const i = progress_step - 2;
					this.ctx.fillText(this.text, pos.x + i * (this.font_size) * this.draw_style.side, pos.y + i * (this.font_size));
				}

				private _draw(progress_inverse_quint: number,
							  progress_step: number): void {

								  this.ctx.save();
								  this.ctx.translate(this.win.w2, this.win.h2);

								  if (this.draw_style.style == WORD_STYLE.DEFAULT ||
									  this.draw_style.style == WORD_STYLE.BACKGROUND) {
									  this.actual_font_size = this.font_size * progress_inverse_quint;
								  this.square.yf = this.actual_font_size * 0.9;
								  this.square.yi = this.actual_font_size * 0.8;
								  this.ctx.font = `${this.actual_font_size}px ${this.font}`;
								  this._draw_text_default();
								  } else if (WORD_STYLE.OUTLINE) {
									  this.actual_font_size = this.font_size;
									  this.ctx.font = `${this.actual_font_size}px ${this.font}`;
									  this._draw_text_1(progress_step);
								  }
								  this.ctx.restore();
							  }

							  public update(progress_inverse_quint: number, progress_step: number): void {
								  this.font_size = Math.min(this.win.w/10, this.win.h/10);
								  this._draw(progress_inverse_quint, progress_step);
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
	options: {
		color_vel: boolean,
		progress_vel: boolean,
		vel: number,
		bounce: boolean
	};

	constructor(color: { background: string, colors: string[] },
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number },
				options: { color_vel: boolean, progress_vel: boolean, vel: number, bounce: boolean }) {
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
					this.options = options;
				}

				private _draw(progress_quint: number): void {
					if (this.options.color_vel) {
						this.ctx.strokeStyle = colorTransition((progress_quint/2) * Math.abs(this.vel), this.color.background, this.color.colors[0]);
					} else {
						this.ctx.strokeStyle = this.color.colors[0];
					}
					this.ctx.beginPath();
					this.ctx.moveTo(this.p_1.x, this.p_1.y);
					this.ctx.lineTo(this.p_2.x, this.p_2.y);
					this.ctx.stroke();
					this.ctx.strokeStyle = this.color.colors[0];
				}

				public update(progress_quint: number): void {
					let speed = this.options.vel * this.vel;
					if (this.options.progress_vel) speed *= progress_quint;
					if (this.r) {
						this.p_1.x += speed;
						this.p_2.x += speed;
						if (this.options.bounce)
						if (this.p_1.x > this.win.w ||
							this.p_1.x < 0 ||
								this.p_2.x > this.win.w ||
									this.p_2.x < 0)
							this.options.vel = - this.options.vel;
					} else {
						this.p_1.y += speed;
						this.p_2.y += speed;
						if (this.options.bounce)
						if (this.p_1.y > this.win.h ||
							this.p_1.y < 0 ||
								this.p_2.y > this.win.h ||
									this.p_2.y < 0)
							this.options.vel = - this.options.vel;
					}
					this._draw(progress_quint);
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
	}

	private _setup_style(empty: boolean): void {
		if (empty) {
			this.draw_style = 0;
			return;
		}
		this.draw_style = get_random(1, 1);
	}

	public reset(empty: boolean): void {
		this._setup_style(empty);
	}

	private _draw_vertical(progress_inverse_quint: number): void {
		const rect_size = progress_inverse_quint * this.win.h * 0.2;
		this.color.colors[0];
		this.ctx.fillRect(0, 0, this.win.w, this.win.h2 - rect_size/2);
		this.ctx.fillRect(0, this.win.h2 + rect_size/2,
						  this.win.w, this.win.h2 - rect_size/2);
	}

	private _draw(progress_inverse_quint: number) {
		if (this.draw_style == 1)
			this._draw_vertical(progress_inverse_quint);
	}

	public update(progress_inverse_quint: number) {
		this._draw(progress_inverse_quint);
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
		progress: {
			default: number,
			quint: number,
			inverse: number,
			inverse_quint: number,
			inverse_cubic: number,
			step: number
		},
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
		draw_style: WORD_STYLE,
		draw_style_length: number
	};


	constructor(font: string, lyrics: Lyric[],
				color: { background: string, colors: string[] },
				ctx: CanvasRenderingContext2D, win: { w: number, w2: number, h: number, h2: number }) {
					this.ctx = ctx;
					this.win = win;
					this.options = {
						progress: {
							default: 0.0,
							quint: 0.0,
							inverse: 0.0,
							inverse_quint: 0.0,
							inverse_cubic: 0.0,
							step: 0.0
						},
						play: false,
						color: color
					};
					this._set_color_style();

					let total_time = 0;
					for (let l of lyrics) total_time += l.time;
					this.lyrics = {
						lyrics: lyrics,
						index: 0,
						total_time: total_time
					};

					const draw_style_length = Object.keys(WORD_STYLE).filter(key => !isNaN(parseInt(key))).map(key => parseInt(key)).length;
					const draw_style = get_random(0, draw_style_length - 1);

					this.render = {
						word: new Word(font,
									   this.lyrics.lyrics[0].text,
									   draw_style,
									   this.options.color,
									   this.ctx,
									   this.win),
									   background: new Background(this.options.color,
																  this.ctx,
																  this.win),
																  lines: [],
																  shapes: [],
																  draw_style: draw_style,
																  draw_style_length: draw_style_length
					};
				}

				public start(): void {
					this.options.play = !this.options.play;
				}

				private _next_word(): void {
					this.lyrics.index = (this.lyrics.index + 1) % this.lyrics.lyrics.length;
					this.render.word.set_word(this.lyrics.lyrics[this.lyrics.index].text, this.render.draw_style);
				}

				private _reset_lines(empty: boolean): void {
					this.render.lines = [];
					if (empty) return;
					if (get_boolean()) return;
					for (let i=0; i<get_random(1,8); i++)
					this.render.lines.push(new Line(this.options.color,
													this.ctx,
													this.win,
													{
														color_vel: true,
														progress_vel: true,
														vel: 5,
														bounce: false
													}));
				}

				private _reset_shapes(empty: boolean): void {
					this.render.shapes = [];
					if (empty) return;
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
					this.render.draw_style = get_random(0, this.render.draw_style_length - 1);
					this._next_word();
					if (this.render.draw_style == WORD_STYLE.DEFAULT) {
						this.render.background.reset(true);
						this._reset_lines(false);
						this._reset_shapes(false);
					} else if (this.render.draw_style == WORD_STYLE.BACKGROUND) {
						this.render.background.reset(false);
						this._reset_lines(true);
						this._reset_shapes(true);
					} else if (this.render.draw_style == WORD_STYLE.OUTLINE) {
						this.render.background.reset(true);
						this._reset_lines(true);
						this._reset_shapes(true);
					}
				}

				private _set_color_style(): void {
					this.ctx.fillStyle = this.options.color.colors[0];
					this.ctx.strokeStyle = this.options.color.colors[0];
				}

				private _draw(): void {
					this.ctx.fillStyle = this.options.color.background;
					this.ctx.fillRect(0, 0, this.win.w, this.win.h);
					this._set_color_style();
					for (let l of this.render.lines)
						l.update(this.options.progress.quint);
					for (let s of this.render.shapes)
						s.update(this.options.progress.default,
								 this.options.progress.inverse,
								 this.options.progress.inverse_quint);
								 this.render.word.update(this.options.progress.inverse_quint,
														 this.options.progress.step);
														 this.render.background.update(this.options.progress.inverse_quint);
				}

				public update(time: number): void {
					if (!this.options.play) return;
					let time_gap = 0;
					for (let i=0; i<this.lyrics.index; ++i) {
						time_gap += this.lyrics.lyrics[i].time;
					}

					const time_wait = this.lyrics.lyrics[this.lyrics.index].time;
					const current_time = time - time_gap;

					if (current_time > time_wait) {
						this._reset();
						return;
					} else {
						const progress = (current_time * 2) / time_wait;
						const progress_inverse = (progress > 1) ? 2 - progress : progress;
						this.options.progress = {
							default: progress/2,
							quint: easeOutQuint(progress/2),
							inverse: progress_inverse,
							inverse_quint: easeOutQuint(progress_inverse),
							inverse_cubic: easeOutCubic(progress_inverse),
							step: Math.floor(progress * 2.5)
						};
					}
					this._draw();
				}
}

export class Menu {
	ctx: CanvasRenderingContext2D;
	win: { w: number, w2: number, h: number, h2: number }
	font: string;
	title: string;
	links: string[];
	color: {
		background: string,
		colors: string[]
	};
	button: {
		offset: number,
		size: number
	};
	lines!: Line[];
	progress!: number;

	constructor(font: string, title: string, links: string[],
				color: { background: string, colors: string[]},
				ctx: CanvasRenderingContext2D,
				win: { w: number, w2: number, h: number, h2: number }) {
					this.ctx = ctx;
					this.win = win;
					this.font = font;
					this.title = title;
					this.links = links;
					this.color = color;
					this.button =  {
						offset: 3,
						size: 0
					};
					this._setup_lines();
				}

				private _draw_title(): void {
					this.ctx.fillText(this.title, this.win.w2 - this.ctx.measureText(this.title).width/2, this.win.h2 - 200);
				}

				private _draw_links(): void {
					for (let i=0; i<this.links.length; ++i)
					this.ctx.fillText(this.links[i],
									  this.win.w2 - this.ctx.measureText(this.links[i]).width/2,
									  this.win.h2 + 200 + 50 * i);
				}

				private _draw_play(): void {
					const icon_size = Math.max(this.win.w/14, this.win.h/14);
					this.ctx.fillStyle = this.color.background;
					const size2 = icon_size/2;
					const size_sqrt_33 = icon_size * Math.sqrt(3)/6;
					const offset = {
						x: this.win.w2 - size_sqrt_33/2,
						y: this.win.h2
					};
					this.ctx.beginPath();
					this.ctx.moveTo(offset.x + size_sqrt_33 * 2, offset.y);
					this.ctx.lineTo(offset.x -size_sqrt_33,      offset.y + size2);
					this.ctx.lineTo(offset.x -size_sqrt_33,      offset.y - size2);
					this.ctx.lineTo(offset.x + size_sqrt_33 * 2, offset.y);
					this.ctx.lineTo(offset.x -size_sqrt_33,      offset.y + size2);
					this.ctx.fill();
				}

				private _is_inside_button(mouse: {x: number, y: number}): boolean {
					if (mouse.x < this.win.w2 + this.button.size/2 &&
						mouse.x > this.win.w2 - this.button.size/2 &&
							mouse.y < this.win.h2 + this.button.size/2 &&
								mouse.y > this.win.h2 - this.button.size/2) {
						return true;
					} else {
						return false;
					}
				}

				private _draw_buttons(mouse: { x: number, y: number }): void {
					this.button.size = Math.max(this.win.w/8, this.win.h/8);
					if (this._is_inside_button(mouse)) {
						if (this.button.offset < 10)
							this.button.offset += 1;
					} else {
						if (this.button.offset > 4)
							this.button.offset -= 1;
					}
					this.ctx.fillStyle = this.color.colors[0];
					this.ctx.strokeStyle = this.color.colors[0];
					this.ctx.fillRect(this.win.w2 - this.button.size/2,
									  this.win.h2 - this.button.size/2,
									  this.button.size,
									  this.button.size);
									  this.ctx.strokeRect(this.win.w2 - this.button.size/2 + this.button.offset,
														  this.win.h2 - this.button.size/2 + this.button.offset,
														  this.button.size,
														  this.button.size);
														  this.ctx.strokeRect(this.win.w2 - this.button.size/2 - this.button.offset,
																			  this.win.h2 - this.button.size/2 - this.button.offset,
																			  this.button.size,
																			  this.button.size);
																			  this._draw_play();
				}

				private _setup_lines(): void {
					this.progress = 0.0;
					this.lines = [];
					for (let i=0; i<get_random(4,8); i++)
					this.lines.push(new Line(this.color,
											 this.ctx,
											 this.win,
											 {
												 color_vel: false,
												 progress_vel: false,
												 vel: 0.05,
												 bounce: true
											 }));
				}

				private _draw(mouse: { x: number, y: number }): void {
					this.ctx.fillStyle = this.color.background;
					this.ctx.fillRect(0, 0, this.win.w, this.win.h);
					for (let l of this.lines) l.update(this.progress);
					this._draw_buttons(mouse);
					this.ctx.fillStyle = this.color.colors[0];
					this.ctx.font = `50px ${this.font}`;
					this._draw_title();
					this.ctx.font = `25px ${this.font}`;
					this._draw_links();
				}

				public update(mouse: { x: number, y: number }): void {
					this.progress += 0.01;
					this._draw(mouse);
				}

				public hit_button(mouse: {x: number, y: number}): boolean {
					if (this._is_inside_button(mouse)) {
						this._setup_lines();
						return true;
					}
					return false;
				}
}
