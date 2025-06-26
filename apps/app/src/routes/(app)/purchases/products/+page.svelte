<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import ComputersForm from './ProductsForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { formatDate } from '$lib/utils/functions';
	import { Input } from '$lib/components/ui/input';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	let searchParams: any = $state({
		name: ''
	});

	const computers = createQuery({
		queryKey: ['purchases-products'],
		queryFn: async () => (await api.get('/purchases/products', { params: searchParams })).data
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
	{#snippet left()}
		<Input
			menu
			bind:value={searchParams.name}
			placeholder="Buscar"
			oninput={() => refetch(['purchases-products'])}
		/>
	{/snippet}
	{#snippet right()}
		<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir producto</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[50%]">Codigo</TableHead>
		<TableHead class="w-[50%]">Descripción</TableHead>
		<TableHead class="">Medida</TableHead>
		<TableHead class="">Categoría</TableHead>
		<TableHead class="">Precio</TableHead>
		<TableHead class="">Agregado</TableHead>
	</TableHeader>
	<TableBody>
		{#each $computers?.data as device, i}
			<TableRow>
				<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				<TableCell class="max-w-32 truncate">{device.code || ''}</TableCell>
				<TableCell class="max-w-64 truncate">{device.description || ''}</TableCell>
				<TableCell>{device.measurement || ''}</TableCell>
				<TableCell>{device.category || ''}</TableCell>
				<TableCell>{device.price || ''}</TableCell>
				<TableCell>{formatDate(device.created_at) || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ComputersForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Borrar producto"
	deleteFunc={async () => {
		await api.delete('/purchases/products', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Producto eliminado');
		refetch(['purchases-products']);
		show1 = false;
	}}
/>
