<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Input from '$lib/components/ui/input/input.svelte';
	import { refetch } from '$lib/utils/query';

	let filters = $state({
		date: new Date().toISOString().split('T')[0]
	});

	const orders = createQuery({
		queryKey: ['reports-areas'],
		queryFn: async () =>
			(
				await api.get(`/reports/production/areas`, {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['reports-areas']);
	});

	function formatAvg(avg: number) {
		return (Number(avg) * 100).toFixed(2) + '%';
	}

	function calculateWeekAvg(row: any) {
		const days = [row.mondayAvg, row.tuesdayAvg, row.wednesdayAvg, row.thursdayAvg, row.fridayAvg];
		const nonZeroDays = days.filter((day) => day !== null);

		const sum = nonZeroDays.reduce((acc, day) => acc + day, 0);
		return sum / nonZeroDays.length;
	}

	function calculateTotalAvg(rows: any[]) {
		const sum = rows.reduce((acc, row) => acc + calculateWeekAvg(row), 0);
		return sum / rows.length;
	}
</script>

<MenuBar>
	<div class="flex flex-col gap-1.5 lg:flex-row">
		<Input type="date" menu bind:value={filters.date} />
	</div>
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead>Area</TableHead>
		<TableHead>Lunes</TableHead>
		<TableHead>Martes</TableHead>
		<TableHead>Miercoles</TableHead>
		<TableHead>Jueves</TableHead>
		<TableHead>Viernes</TableHead>
		<TableHead>Promedio</TableHead>
		<TableHead class="w-full"></TableHead>
	</TableHeader>
	<TableBody>
		{#each $orders?.data as row}
			<TableRow>
				<TableCell>{row.name || ''}</TableCell>
				<TableCell class={row.mondayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.mondayAvg)}</TableCell
				>
				<TableCell class={row.tuesdayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.tuesdayAvg)}</TableCell
				>
				<TableCell class={row.wednesdayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.wednesdayAvg)}</TableCell
				>
				<TableCell class={row.thursdayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.thursdayAvg)}</TableCell
				>
				<TableCell class={row.fridayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.fridayAvg)}</TableCell
				>
				<TableCell class={calculateWeekAvg(row) >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(calculateWeekAvg(row))}</TableCell
				>
				<TableCell></TableCell>
			</TableRow>
		{/each}
		<TableRow>
			<TableCell colspan={5}></TableCell>
			<TableCell>Total:</TableCell>
			<TableCell class={calculateTotalAvg($orders?.data) >= 1 ? 'bg-green-100' : ''}
				>{formatAvg(calculateTotalAvg($orders?.data))}</TableCell
			>
		</TableRow>
	</TableBody>
</CusTable>
