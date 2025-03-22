<script lang="ts">
	import { run } from 'svelte/legacy';
	import Chart from 'chart.js/auto';
	import { greens } from '../../utils/colors';
	import { browser } from '$app/environment';
	interface Props {
		data: { value: number; name: string }[];
	}

	let { data }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();

	const drawChart = () => {
		if (!canvas) return;
		if (Chart.getChart(canvas)) {
			Chart.getChart(canvas)?.destroy();
		}

		new Chart(canvas, {
			type: 'pie',

			data: {
				labels: data.map((row) => row.name),
				datasets: [
					{
						data: data.map((row) => row.value),
						backgroundColor: greens,
						borderAlign: 'center',
						borderWidth: 0
					}
				]
			},

			options: {
				responsive: true,
				maintainAspectRatio: true,
				interaction: {
					intersect: false,
					axis: 'x'
				},
				layout: {},
				plugins: {
					legend: {
						display: false
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
				cutout: '60%',
				radius: '90%',
				hoverBorderColor: 'transparent',
				animation: {
					animateScale: false,
					animateRotate: false
				}
			}
		});
	};

	run(() => {
		if (data[0] && browser && canvas) drawChart();
	});
</script>

<canvas bind:this={canvas} class="max-h-[calc(100%-1.5rem)] w-full"></canvas>
