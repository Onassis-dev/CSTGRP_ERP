<script lang="ts">
	import BarChart from '$lib/components/charts/BarChart.svelte';
	import { CardHeader, CardTitle, CardContent, Card } from '$lib/components/ui/card';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { Input } from '$lib/components/ui/input';

	let values: { area: string; data: { value: number; name: string }[] }[] | null = $state(null);
	let date = $state(new Date().toISOString().split('T')[0]);

	async function fetchData(date: string) {
		values = (await api.get('/reports/history', { params: { date } })).data;
	}

	$effect(() => {
		fetchData(date);
	});
</script>

<MenuBar>
	<Input menu type="date" bind:value={date} />
</MenuBar>

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
