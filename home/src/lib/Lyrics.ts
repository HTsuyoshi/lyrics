// Constants
export const color_1: string = '#dadada';
export const color_2: string = '#1e1e2e';

// Essential functions
export function get_random(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
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
