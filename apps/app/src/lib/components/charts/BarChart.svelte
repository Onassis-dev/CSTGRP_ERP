<script lang="ts">
	import { run } from 'svelte/legacy';
	import Chart from 'chart.js/auto';
	import { type ColorKeys, colors } from '../../utils/colors';
	import { browser } from '$app/environment';
	interface Props {
		color: ColorKeys;
		data: { value: number; name: string }[];
		label: any;
		maxValue?: number | undefined;
		stepSize?: number | undefined;
		minValue?: number | undefined;
	}

	let {
		color,
		data,
		label,
		maxValue = $bindable(undefined),
		stepSize = undefined,
		minValue = undefined
	}: Props = $props();
	let canvas: HTMLCanvasElement | undefined = $state();

	run(() => {
		if (!maxValue) maxValue = Math.max(...data.map((e) => e.value));
	});

	const drawChart = () => {
		if (!canvas) return;
		if (Chart.getChart(canvas)) {
			Chart.getChart(canvas)?.destroy();
		}

		new Chart(canvas, {
			type: 'bar',

			data: {
				labels: data.map((row) => row.name),
				datasets: [
					{
						label: label,
						data: data.map((row) => row.value),
						backgroundColor: colors['blue'].foreground
					}
				]
			},

			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: 0
				},

				interaction: {
					intersect: false,
					axis: 'x'
				},
				layout: {},
				plugins: {
					legend: {
						display: false,
						position: 'top'
					},
					tooltip: {
						backgroundColor: '#fff',
						titleColor: '#111',
						bodyColor: '#555',

						bodyAlign: 'center',
						borderColor: '#eee',
						borderWidth: 1,
						mode: 'index',
						displayColors: true
					}
				},
				scales: {
					x: {
						grid: {
							display: false
						},
						border: {
							display: false
						},
						ticks: {
							display: true,
							minRotation: 90,
							callback: function (v) {
								return this.getLabelForValue(Number(v))?.split(' ')[1]?.slice(0, 3);
							},
							color: '#6b7280',
							font: {
								size: 12,
								family: 'Inter'
							}
						}
					},
					y: {
						suggestedMax: maxValue ? maxValue + 1 : null,
						suggestedMin: minValue,
						afterBuildTicks: (axis) => {
							const tickValues = new Set(axis.ticks.map((t) => t.value));
							// Agregar 70 y 100 para que se dibujen las líneas
							if (!tickValues.has(70)) axis.ticks.push({ value: 70 });
							if (!tickValues.has(100)) axis.ticks.push({ value: 100 });
							axis.ticks.sort((a, b) => a.value - b.value);
						},
						grid: {
							color: (c) => {
								if (c.tick.value === 100) return colors['green'].foreground;
								else if (c.tick.value === 70) return colors['orange'].foreground;
								else return '#eee';
							},
							lineWidth: (c) => {
								if (c.tick && c.tick.value === 70) return 2;
								if (c.tick && c.tick.value === 100) return 2;
								return 1;
							},
							drawTicks: false
						},
						border: {
							display: false
						},
						ticks: {
							stepSize: stepSize,
							callback: (value) => {
								// Ocultar el label de 70, solo mostrar la línea
								if (value === 70) return '';
								return value + '%';
							},
							font: {
								size: 12,
								family: 'Inter'
							}
						}
					}
				}
			}
		});
	};

	run(() => {
		if (data[0] && browser && canvas) drawChart();
	});
</script>

<canvas bind:this={canvas} class="max-h-[calc(100%-1.5rem)] w-full"></canvas>
