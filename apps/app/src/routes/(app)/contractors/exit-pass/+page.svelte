<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import ExitPassForm from './exitPassForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';
	import { getContractors, getOptions } from '$lib/utils/queries';
	import Input from '$lib/components/ui/input/input.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { Button } from '$lib/components/ui/button';
	import { FileDown, PlusCircle } from 'lucide-svelte';

	let showForm: boolean = $state(false);
	let selectedExitPass: any = $state({});
	let showDelete: boolean = $state(false);

	let filters = $state({
		contractorId: '',
		date: ''
	});

	const exitPassQuery = createQuery({
		queryKey: ['contractors-exit-pass'],
		queryFn: async () =>
			(
				await api.get('/contractors/exit-pass', {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['contractors-exit-pass']);
	});

	const contractors = createQuery({
		queryKey: ['contractors'],
		queryFn: getContractors
	});

	const contractorsQuery = $derived(getOptions($contractors.data));

	function createExitPass() {
		selectedExitPass = {};
		showForm = true;
	}
</script>

<MenuBar>
	<div class="flex flex-col gap-1.5 lg:flex-row">
		<Input menu type="date" bind:value={filters.date} placeholder="Fecha" class="max-w-40" />
		<Select
			placeholder="Contratista"
			menu
			items={contractorsQuery}
			bind:value={filters.contractorId}
			allowDeselect
			class="w-40"
		/>
	</div>
	{#snippet right()}
		<Button onclick={createExitPass} size="action"
			><PlusCircle class="size-3.5" />Añadir pase</Button
		>
	{/snippet}
</MenuBar>
<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="">Folio</TableHead>
		<TableHead class="">Fecha</TableHead>
		<TableHead class="w-full">Contratista</TableHead>
	</TableHeader>
	<TableBody>
		{#each $exitPassQuery?.data as exitPass}
			<TableRow>
				<OptionsCell
					extraButtons={[
						{
							fn: () => {
								window.open(
									import.meta.env.VITE_BASEURL +
										'/contractors/exit-pass/download?id=' +
										exitPass.id,
									'_blank'
								);
							},
							name: 'Descargar',
							icon: FileDown
						}
					]}
					editFunc={() => {
						selectedExitPass = exitPass;
						showForm = true;
					}}
					deleteFunc={() => {
						selectedExitPass = exitPass;
						showDelete = true;
					}}
				/>
				<TableCell>{exitPass.folio}</TableCell>
				<TableCell>{formatDate(exitPass.date)}</TableCell>
				<TableCell>
					<Badge color="gray">
						{$contractors?.data?.[exitPass.contractorId]?.name}
					</Badge>
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ExitPassForm bind:show={showForm} bind:selectedExitPass />

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar pase"
	deleteFunc={async () => {
		await api.delete('/contractors/exit-pass', { data: { id: selectedExitPass.id } });
		showSuccess('Pase eliminado');
		refetch(['contractors-exit-pass']);
		showDelete = false;
	}}
/>
