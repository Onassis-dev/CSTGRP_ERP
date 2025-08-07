<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { formatDate } from '$lib/utils/functions';
	import JobComparisonCard from './JobComparisonCard.svelte';
	import { Ruler } from 'lucide-svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show = $state(false);

	let filters = $state({
		type: 'both',
		code: ''
	});

	let selectedMovement: any = $state({});

	const jobs = createQuery({
		queryKey: ['jobs'],
		queryFn: async () => (await api.get('/clients/jobs', { params: filters })).data
	});

	function compareJob(i: number) {
		selectedMovement = $jobs?.data?.[i];
		show = true;
	}
</script>

<MenuBar>
	<form class="flex flex-col gap-2 lg:flex-row" onsubmit={preventDefault(() => refetch(['jobs']))}>
		<Input menu bind:value={filters.code} placeholder="Job" />
	</form>
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="border-r-0"></TableHead>
		<TableHead class="w-[20%]">JOB</TableHead>
		<TableHead class="w-[20%]">DUE</TableHead>
		<TableHead class="w-full">REGISTERED</TableHead>
	</TableHeader>
	<TableBody>
		{#each $jobs?.data as movement, i}
			<TableRow>
				<OptionsCell
					extraButtons={movement.jobpo
						? [{ fn: () => compareJob(i), name: 'COMPARE', icon: Ruler }]
						: []}
				/>
				<TableCell>{movement.jobpo}</TableCell>
				<TableCell>{formatDate(movement.due)}</TableCell>
				<TableCell>{formatDate(movement.created_at)}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<JobComparisonCard bind:show bind:selectedJob={selectedMovement} />
