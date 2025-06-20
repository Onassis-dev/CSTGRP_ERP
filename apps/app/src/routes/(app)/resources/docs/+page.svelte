<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Cookies from 'js-cookie';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import DocsForm from './DocsForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show = $state(false);
	let show1 = $state(false);
	let selectedRow = $state({});

	const docs = createQuery({
		queryKey: ['docs'],
		queryFn: async () => (await api.get('/resources/docs')).data
	});

	function editRow(i: number) {
		selectedRow = $docs?.data?.[i];
		show = true;
	}
	function createRow() {
		selectedRow = {};
		show = true;
	}
	function deleteRow(i: number) {
		selectedRow = $docs?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createRow}><PlusCircle class=" size-3.5" />Añadir fila</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		<TableHead class="w-[60%]">Documento</TableHead>
		<TableHead class="w-[60%]">Pagina</TableHead>
	</TableHeader>
	<TableBody>
		{#each $docs?.data as row, i}
			<TableRow>
				<OptionsCell editFunc={() => editRow(i)} deleteFunc={() => deleteRow(i)} />
				<TableCell>{row.doc || ''}</TableCell>
				<TableCell>{row.page || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DocsForm bind:show bind:selectedRow />
<DeletePopUp
	bind:show={show1}
	text="Borrar fila"
	deleteFunc={async () => {
		await api.delete('/resources/docs', {
			data: { id: parseInt((selectedRow as any).id || '') }
		});
		showSuccess('Fila eliminada');
		refetch(['docs']);
		show1 = false;
	}}
/>
