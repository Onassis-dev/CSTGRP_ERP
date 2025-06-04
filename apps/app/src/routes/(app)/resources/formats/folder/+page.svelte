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
	import FormatsForm from './FormatsForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { downloadFile } from '$lib/utils/files';

	const selectedFolder = new URLSearchParams(window.location.search).get('name') || '';

	let show = $state(false);
	let show1 = $state(false);
	let selectedFormat = $state('');

	const canEdit = parseInt(Cookies.get('perm_formats') || '0') == 2;

	const formats = createQuery({
		queryKey: ['formats', selectedFolder],
		queryFn: async () =>
			(await api.get('/resources/formats', { params: { folder: selectedFolder } })).data
	});

	function createDevice() {
		selectedFormat = '';
		show = true;
	}
	function editDevice(i: number) {
		selectedFormat = $formats?.data?.[i];
		show = true;
	}
	function deleteDevice(i: number) {
		selectedFormat = $formats?.data?.[i];
		show1 = true;
	}
</script>

{#if canEdit}
	<MenuBar>
		{#snippet right()}
			<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir archivo</Button>
		{/snippet}
	</MenuBar>
{/if}

<CusTable>
	<TableHeader>
		{#if canEdit}
			<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		{/if}
		<TableHead class="w-full">Nombre</TableHead>
		<TableHead class="w-[1px] p-0"></TableHead>
	</TableHeader>
	<TableBody>
		{#each $formats?.data as format, i}
			<TableRow>
				{#if canEdit}
					<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				{/if}
				<TableCell
					class="flex cursor-pointer items-center gap-2"
					onclick={() => {
						downloadFile({
							url: `/resources/formats/download?name=${format}&folder=${selectedFolder}`,
							name: 'format.pdf'
						});
					}}
				>
					<img src="/pdf.svg" alt="folder" class="size-4" />
					{format}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

{#if canEdit}
	<FormatsForm bind:show bind:selectedFormat {selectedFolder} />
	<DeletePopUp
		bind:show={show1}
		text="Borrar archivo"
		deleteFunc={async () => {
			await api.delete('/resources/formats', {
				data: { name: selectedFormat, folder: selectedFolder }
			});
			showSuccess('Archivo eliminado');
			refetch(['formats', selectedFolder]);
			show1 = false;
		}}
	/>
{/if}
