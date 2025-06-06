<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import ComputersForm from './CategoriesForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	const computers = createQuery({
		queryKey: ['purchases-categories'],
		queryFn: async () => (await api.get('/purchases/categories')).data
	});

	function editDevice(i: number) {
		selectedDevice = $computers?.data?.[i];
		show = true;
	}
	function createDevice() {
		selectedDevice = {};
		show = true;
	}
	function deleteDevice(i: number) {
		selectedDevice = $computers?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir categoria</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		<TableHead class="w-full">Nombre</TableHead>
	</TableHeader>
	<TableBody>
		{#each $computers?.data as device, i}
			<TableRow>
				<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				<TableCell>{device.name || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ComputersForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Borrar categoria"
	deleteFunc={async () => {
		await api.delete('/purchases/categories', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Categoria eliminada');
		refetch(['purchases-categories']);
		show1 = false;
	}}
/>
