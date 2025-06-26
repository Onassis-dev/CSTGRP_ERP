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
	import { goto } from '$app/navigation';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show = $state(false);
	let show1 = $state(false);
	let selectedFolder = $state('');

	const canEdit = parseInt(Cookies.get('perm_formats') || '0') == 2;

	const folders = createQuery({
		queryKey: ['formats-folders'],
		queryFn: async () => (await api.get('/resources/formats/folders')).data
	});

	function createDevice() {
		selectedFolder = '';
		show = true;
	}
	function editDevice(i: number) {
		selectedFolder = $folders?.data?.[i];
		show = true;
	}
	function deleteDevice(i: number) {
		selectedFolder = $folders?.data?.[i];
		show1 = true;
	}
</script>

{#if canEdit}
	<MenuBar>
		{#snippet right()}
			<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir carpeta</Button>
		{/snippet}
	</MenuBar>
{/if}

<CusTable>
	<TableHeader>
		{#if canEdit}
			<OptionsHead />
		{/if}
		<TableHead class="w-full">Nombre</TableHead>
		<TableHead class="w-[1px] p-0"></TableHead>
	</TableHeader>
	<TableBody>
		{#each $folders?.data as folder, i}
			<TableRow>
				{#if canEdit}
					<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				{/if}
				<TableCell
					class="cursor-pointer"
					onclick={() => goto(`/resources/formats/folder?name=${folder}`)}
				>
					<div class="flex w-full items-center gap-2">
						<img src="/folder.svg" alt="folder" class="size-4" />
						{folder}
					</div>
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

{#if canEdit}
	<DirectoryForm bind:show bind:selectedFolder />
	<DeletePopUp
		bind:show={show1}
		text="Borrar carpeta"
		deleteFunc={async () => {
			await api.delete('/resources/formats/folder', { data: { name: selectedFolder } });
			showSuccess('Carpeta eliminada');
			refetch(['formats-folders']);
			show1 = false;
		}}
	/>
{/if}
