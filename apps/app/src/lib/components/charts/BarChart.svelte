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
						backgroundColor: colors[color].foreground
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
								return this.getLabelForValue(String(v))?.split(' ')[1]?.slice(0, 3);
							}
						}
					},
					y: {
						suggestedMax: maxValue ? maxValue + 1 : null,
						suggestedMin: minValue,
						grid: {
							color: '#eee',
							drawTicks: false
						},
						border: {
							display: false
						},
						ticks: {
							stepSize: stepSize,
							color: '#6b7280',
							callback: (value) => value + '%',
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
