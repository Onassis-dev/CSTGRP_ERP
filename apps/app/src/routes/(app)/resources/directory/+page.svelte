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
	import DirectoryForm from './DirectoryForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show = $state(false);
	let show1 = $state(false);
	let selectedRow = $state({});

	const canEdit = parseInt(Cookies.get('perm_directory') || '0') == 2;

	const directory = createQuery({
		queryKey: ['directory'],
		queryFn: async () => (await api.get('/resources/directory')).data
	});

	function editRow(i: number) {
		selectedRow = $directory?.data?.[i];
		show = true;
	}
	function createRow() {
		selectedRow = {};
		show = true;
	}
	function deleteRow(i: number) {
		selectedRow = $directory?.data?.[i];
		show1 = true;
	}
</script>

{#if canEdit}
	<MenuBar>
		{#snippet right()}
			<Button onclick={createRow} size="action"><PlusCircle class=" size-3.5" />Añadir fila</Button>
		{/snippet}
	</MenuBar>
{/if}

<CusTable>
	<TableHeader>
		{#if canEdit}
			<OptionsHead />
		{/if}
		<TableHead class="w-[25%]">Nombre</TableHead>
		<TableHead class="w-[25%]">Posicion</TableHead>
		<TableHead class="w-[100%]">Correo</TableHead>
		<TableHead class="w-[100%]">Extension</TableHead>
	</TableHeader>
	<TableBody>
		{#each $directory?.data as row, i}
			<TableRow>
				{#if canEdit}
					<OptionsCell editFunc={() => editRow(i)} deleteFunc={() => deleteRow(i)} />
				{/if}
				<TableCell>{row.name || ''}</TableCell>
				<TableCell>{row.position || ''}</TableCell>
				<TableCell><a href="mailto:{row.email || ''}">{row.email || ''}</a></TableCell>
				<TableCell>{row.extension || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

{#if canEdit}
	<DirectoryForm bind:show bind:selectedRow />
	<DeletePopUp
		bind:show={show1}
		text="Eliminar contacto"
		deleteFunc={async () => {
			await api.delete('/resources/directory', {
				data: { id: parseInt((selectedRow as any).id || '') }
			});
			showSuccess('Fila eliminada');
			refetch(['directory']);
			show1 = false;
		}}
	/>
{/if}
