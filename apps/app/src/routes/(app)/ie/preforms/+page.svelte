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
	import PreformsForm from './PreformsForm.svelte';

	let showDelete = $state(false);
	let showForm = $state(false);

	let filters = $state({
		jobpo: ''
	});

	let selectedRow: any = $state({});

	const preformsQuery = createQuery({
		queryKey: ['preforms', { ...filters }],
		queryFn: async () => (await api.get('/ie/preforms', { params: filters })).data
	});
	let preforms = $derived($preformsQuery?.data || []);

	async function handleDelete() {
		await api.delete('/ie/preforms/' + selectedRow.id);
		selectedRow = {};
		showSuccess('Preforma eliminada');
		refetch(['preforms']);
		showDelete = false;
	}

	function deletePreform(i: number) {
		selectedRow = preforms[i];
		showDelete = true;
	}

	function editPreform(i: number) {
		selectedRow = preforms[i];
		showForm = true;
	}

	function downloadPreform(i: number) {
		window.open(
			import.meta.env.VITE_BASEURL + '/ie/preforms/download?id=' + preforms[i]?.id,
			'_blank'
		);
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['preforms']))}
	>
		<Input menu bind:value={filters.jobpo} placeholder="Job PO" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedRow = {};
				showForm = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[100%]">Factura</TableHead>
	</TableHeader>
	<TableBody>
		{#each preforms as preform, i}
			<TableRow>
				<OptionsCell
					editFunc={() => editPreform(i)}
					deleteFunc={() => deletePreform(i)}
					extraButtons={[
						{
							fn: () => downloadPreform(i),
							name: 'Descargar',
							icon: FileDown
						}
					]}
				/>
				<TableCell>{preform.noFactura}</TableCell>
				<TableCell>{preform.date}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={showDelete} text="Eliminar preforma" deleteFunc={handleDelete} />
<PreformsForm bind:show={showForm} bind:selectedRow />
