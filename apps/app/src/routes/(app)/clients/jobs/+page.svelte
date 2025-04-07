<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { formatDate } from '$lib/utils/functions';
	import JobComparisonCard from './JobComparisonCard.svelte';
	import { Ruler } from 'lucide-svelte';
	let show = $state(false);

	let filters = $state({
		type: 'both',
		code: ''
	});

	let selectedMovement: any = $state({});

	let options = [
		{ value: 'both', name: 'Ambos' },
		{ value: 'imports', name: 'Importaciones' },
		{ value: 'exports', name: 'Exportaciones' }
	];

	let movements: any[] = $state([]);

	async function getMovements() {
		const result = (await api.get(`/clients/jobs`, { params: filters })).data;

		movements = result.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		});
	}

	function compareJob(i: number) {
		selectedMovement = movements[i];
		show = true;
	}

	onMount(() => {
		getMovements();
	});
</script>

<MenuBar>
	<form class="flex flex-col gap-2 lg:flex-row" onsubmit={preventDefault(getMovements)}>
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
		{#each movements as movement, i}
			<TableRow>
				<OptionsCell
					extraButtons={movement.jobpo
						? [{ fn: () => compareJob(i), name: 'COMPARE', icon: Ruler }]
						: []}
				/>
				<TableCell>{movement.jobpo || ''}</TableCell>
				<TableCell>{formatDate(movement.due) || ''}</TableCell>
				<TableCell>{formatDate(movement.created_at) || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<JobComparisonCard bind:show bind:selectedJob={selectedMovement} />
