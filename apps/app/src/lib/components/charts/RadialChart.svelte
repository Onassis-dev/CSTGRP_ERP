<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import { Chart } from 'flowbite-svelte';
	interface Props {
		progress: number;
		name: string;
	}

	let { progress, name }: Props = $props();

	let options: ApexOptions = $derived({
		colors: ['#95d0fe', '#e16540', '#9998fe', '#fbc766', '#e2e1de'],
		series: [Math.floor(progress * 100)],
		chart: {
			height: '100%',
			width: '100%',
			type: 'radialBar'
		},

		labels: [name],
		dataLabels: {
			enabled: false
		}
	});
</script>

<Chart {options} class="py-6" />
