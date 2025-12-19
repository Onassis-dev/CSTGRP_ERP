<script lang="ts">
	import ExportMovementsForm from './ExportMovementsForm.svelte';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';
	import JobComparisonCard from './JobComparisonCard.svelte';
	import { Pen, Ruler } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { Button } from '$lib/components/ui/button';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import Search from '@lucide/svelte/icons/search';

	let show2 = $state(false);
	let show3 = $state(false);
	let show5 = $state(false);

	let filters = $state({
		job: '',
		programation: ''
	});

	let selectedMovement: any = $state({});

	const movementsQuery = createQuery({
		queryKey: ['jobs', { ...filters }],
		queryFn: async () => (await api.get('/jobs', { params: filters })).data
	});

	let movements = $derived(
		$movementsQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function deleteIE(i: number) {
		selectedMovement = movements[i];
		show3 = true;
	}
	function editJobPO(i: number) {
		selectedMovement = movements[i];
		show5 = true;
	}
	function compareJob(i: number) {
		selectedMovement = movements[i];
		show2 = true;
	}

	async function handleDelete() {
		await api.delete('/jobs/' + selectedMovement.id);
		selectedMovement = {};
		showSuccess('Movimiento eliminado');
		refetch(['jobs']);
		show3 = false;
	}
</script>

<MenuBar>
	<form class="flex flex-col gap-2 lg:flex-row">
		<Input
			menu
			bind:value={filters.job}
			placeholder="Job"
			onkeypress={(e) => e.key === 'Enter' && refetch(['jobs'])}
		/>
		<Input
			menu
			bind:value={filters.programation}
			placeholder="Programación"
			onkeypress={(e) => e.key === 'Enter' && refetch(['jobs'])}
		/>
		<Button size="action" variant="outline" onclick={() => refetch(['jobs'])}
			><Search class=" size-3.5" /></Button
		>
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedMovement = {};
				show5 = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[10%]">Job-PO</TableHead>
		<TableHead class="w-[10%]">Programacion</TableHead>
		<TableHead class="w-full">Fecha</TableHead>
	</TableHeader>
	<TableBody>
		{#each movements as movement, i}
			<TableRow>
				<OptionsCell
					editFunc={() => editJobPO(i)}
					deleteFunc={() => deleteIE(i)}
					extraButtons={[{ fn: () => compareJob(i), name: 'Comparar', icon: Ruler }]}
				/>
				<TableCell>{movement.ref || ''}</TableCell>
				<TableCell>{movement.programation || ''}</TableCell>
				<TableCell>{formatDate(movement.due) || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<JobComparisonCard bind:show={show2} bind:selectedJob={selectedMovement} />
<DeletePopUp bind:show={show3} text="Eliminar movimiento" deleteFunc={handleDelete} />
<ExportMovementsForm bind:show={show5} {selectedMovement} />
