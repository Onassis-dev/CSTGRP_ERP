<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import { CardHeader, CardTitle, CardContent, Card } from '$lib/components/ui/card';
	import api from '$lib/utils/server';
	let values: { area: string; data: { value: number; name: string }[] }[] | null = $state(null);

	async function fetchData() {
		values = (await api.get('/reports/history')).data;
	}

	fetchData();
</script>

<div class="space-y-4 p-8">
	{#if values}
		{#each values as { area, data }}
			<Card class="col-span-9 w-full max-w-full">
				<CardHeader>
					<CardTitle>{area}</CardTitle>
				</CardHeader>
				<CardContent chart class="h-72">
					<BarChart stepSize={20} label={area} {data} color="green" minValue={0}></BarChart>
				</CardContent>
			</Card>
		{/each}
	{/if}
</div>
