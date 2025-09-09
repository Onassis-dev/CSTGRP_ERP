<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Input from '$lib/components/ui/input/input.svelte';
	import { refetch } from '$lib/utils/query';
	import { UserIcon } from 'lucide-svelte';

	let filters = $state({
		date: new Date().toISOString().split('T')[0]
	});

	const orders = createQuery({
		queryKey: ['reports-areas'],
		queryFn: async () =>
			(
				await api.get(`/reports/areas`, {
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
		const nonZeroDays = days.filter((day) => day !== null && day !== 0);

		const sum = nonZeroDays?.reduce((acc, day) => acc + day, 0);
		return sum / nonZeroDays?.length;
	}

	let totalAvg = $derived.by(() => {
		const rows = $orders?.data;
		if (!rows) return 0;
		const days: { avg: number; minutes: number }[] = [];

		rows.forEach((row: any) => {
			days.push({ avg: row.mondayAvg, minutes: Number(row.mondayMinutes) });
			days.push({ avg: row.tuesdayAvg, minutes: Number(row.tuesdayMinutes) });
			days.push({ avg: row.wednesdayAvg, minutes: Number(row.wednesdayMinutes) });
			days.push({ avg: row.thursdayAvg, minutes: Number(row.thursdayMinutes) });
			days.push({ avg: row.fridayAvg, minutes: Number(row.fridayMinutes) });
		});

		const sum = days.reduce((acc, day) => acc + day.avg * day.minutes, 0);
		const totalMinutes = days.reduce((acc, day) => acc + day.minutes, 0);
		return sum / totalMinutes;
	});
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
		<TableHead><UserIcon class="size-3.5" /></TableHead>
		<TableHead>Martes</TableHead>
		<TableHead><UserIcon class="size-3.5" /></TableHead>
		<TableHead>Miercoles</TableHead>
		<TableHead><UserIcon class="size-3.5" /></TableHead>
		<TableHead>Jueves</TableHead>
		<TableHead><UserIcon class="size-3.5" /></TableHead>
		<TableHead>Viernes</TableHead>
		<TableHead><UserIcon class="size-3.5" /></TableHead>
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
				<TableCell class="bg-gray-50">{(row.mondayMinutes / 570).toFixed(2) || ''}</TableCell>
				<TableCell class={row.tuesdayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.tuesdayAvg)}</TableCell
				>
				<TableCell class="bg-gray-50">{(row.tuesdayMinutes / 570).toFixed(2) || ''}</TableCell>
				<TableCell class={row.wednesdayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.wednesdayAvg)}</TableCell
				>
				<TableCell class="bg-gray-50">{(row.wednesdayMinutes / 570).toFixed(2) || ''}</TableCell>
				<TableCell class={row.thursdayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.thursdayAvg)}</TableCell
				>
				<TableCell class="bg-gray-50">{(row.thursdayMinutes / 570).toFixed(2) || ''}</TableCell>
				<TableCell class={row.fridayAvg >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(row.fridayAvg)}</TableCell
				>
				<TableCell class="bg-gray-50">{(row.fridayMinutes / 570).toFixed(2) || ''}</TableCell>
				<TableCell class={calculateWeekAvg(row) >= 1 ? 'bg-green-100' : ''}
					>{formatAvg(calculateWeekAvg(row))}</TableCell
				>
				<TableCell></TableCell>
			</TableRow>
		{/each}
		<TableRow>
			<TableCell colspan={10}></TableCell>
			<TableCell>Total:</TableCell>
			<TableCell class={totalAvg >= 1 ? 'bg-green-100' : ''}>{formatAvg(totalAvg)}</TableCell>
		</TableRow>
	</TableBody>
</CusTable>
