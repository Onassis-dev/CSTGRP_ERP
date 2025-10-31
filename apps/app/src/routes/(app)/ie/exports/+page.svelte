<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { FileDown, Pen } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { Button } from '$lib/components/ui/button';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import ExportsCard from './ExportsCard.svelte';
	import PackingListForm from './PackingListForm.svelte';

	let show3 = $state(false);
	let show4 = $state(false);
	let showForm = $state(false);

	let filters = $state({
		jobpo: ''
	});

	let selectedRow: any = $state({});

	const movementsQuery = createQuery({
		queryKey: ['exports', { ...filters }],
		queryFn: async () => (await api.get('/ie/exports', { params: filters })).data
	});
	let movements = $derived($movementsQuery?.data || []);

	function viewExport(i: number) {
		selectedRow = movements[i];
		show4 = true;
	}

	async function handleDelete() {
		await api.delete('/ie/exports/' + selectedRow.id);
		selectedRow = {};
		showSuccess('Destino eliminado');
		refetch(['exports']);
		show3 = false;
	}

	function deleteIE(i: number) {
		selectedRow = movements[i];
		show3 = true;
	}

	function downloadPackingList(i: number) {
		window.open(
			import.meta.env.VITE_BASEURL + '/ie/packing-list/download?id=' + movements[i]?.id,
			'_blank'
		);
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['exports']))}
	>
		<Input menu bind:value={filters.jobpo} placeholder="Job PO" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedRow = {};
				show4 = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[100%]">SO</TableHead>
	</TableHeader>
	<TableBody>
		{#each movements as movement, i}
			<TableRow>
				<OptionsCell
					viewFunc={() => viewExport(i)}
					deleteFunc={() => deleteIE(i)}
					extraButtons={movement.exported
						? [
								{
									fn: () => downloadPackingList(i),
									name: 'Descargar',
									icon: FileDown
								}
							]
						: undefined}
				/>
				<TableCell>{movement.so}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={show3} text="Eliminar destino" deleteFunc={handleDelete} />
<ExportsCard bind:show={show4} {selectedRow} bind:showForm />
<PackingListForm bind:show={showForm} bind:selectedRow />
