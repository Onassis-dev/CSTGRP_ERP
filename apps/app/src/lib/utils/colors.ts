export const colors: Record<string, { foreground: string; balanced: string; DEFAULT: string }> = {
	green: {
		foreground: 'rgb(46, 142, 85)',
		balanced: 'rgb(34, 197, 94)', // green-500
		DEFAULT: 'rgba(46, 142, 85, 0.02)'
	},
	blue: {
		foreground: 'rgb(37, 128, 187)',
		balanced: 'rgb(59, 130, 246)', // blue-500
		DEFAULT: 'rgba(37, 128, 187, 0.02)'
	},
	orange: {
		foreground: 'rgb(207, 68, 19)',
		balanced: 'rgb(249, 115, 22)', // orange-500
		DEFAULT: 'rgba(207, 68, 19, 0.02)'
	},
	yellow: {
		foreground: 'rgb(204, 137, 18)',
		balanced: 'rgb(234, 179, 8)', // yellow-500
		DEFAULT: 'rgba(204, 137, 18, 0.02)'
	},
	purple: {
		foreground: 'rgb(111, 27, 210)',
		balanced: 'rgb(168, 85, 247)', // purple-500
		DEFAULT: 'rgba(111, 27, 210, 0.02)'
	},
	cyan: {
		foreground: 'rgb(18, 157, 135)',
		balanced: 'rgb(6, 182, 212)', // cyan-500
		DEFAULT: 'rgba(18, 157, 135, 0.02)'
	},
	red: {
		foreground: 'rgb(229, 30, 36)',
		balanced: 'rgb(239, 68, 68)', // red-500
		DEFAULT: 'rgba(229, 30, 36, 0.02)'
	}
};

export const greens = [
	'hsl(142, 88%, 28%)',
	'hsl(140, 74%, 44%)',
	'hsl(139, 65%, 20%)',
	'hsl(141, 40%, 9%)',
	'hsl(137, 55%, 15%)'
];
export type ColorKeys = keyof typeof colors;
