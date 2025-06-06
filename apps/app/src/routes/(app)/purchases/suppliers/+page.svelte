<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import ComputersForm from './SuppliersForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { formatDate } from '$lib/utils/functions';
	import { Input } from '$lib/components/ui/input';

	let searchParams: any = $state({
		name: ''
	});

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	const computers = createQuery({
		queryKey: ['purchases-suppliers'],
		queryFn: async () => (await api.get('/purchases/suppliers', { params: searchParams })).data
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
			oninput={() => refetch(['purchases-suppliers'])}
		/>
	{/snippet}
	{#snippet right()}
		<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir proveedor</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		<TableHead class="w-[50%]">Nombre</TableHead>
		<TableHead class="w-[50%]">Contacto</TableHead>
		<TableHead class="">RFC</TableHead>
		<TableHead class="">Email</TableHead>
		<TableHead class="">Teléfono</TableHead>
		<TableHead class="">Dirección</TableHead>
		<TableHead class="">Fecha</TableHead>
		<TableHead class="">Moneda</TableHead>
		<TableHead class="">Total compras</TableHead>
		<TableHead class="">Última compra</TableHead>
		<TableHead class="">Fecha de registro</TableHead>
	</TableHeader>
	<TableBody>
		{#each $computers?.data as device, i}
			<TableRow>
				<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				<TableCell>{device.name || ''}</TableCell>
				<TableCell>{device.atention || ''}</TableCell>
				<TableCell>{device.document || ''}</TableCell>
				<TableCell>{device.email || ''}</TableCell>
				<TableCell>{device.phone || ''}</TableCell>
				<TableCell>{device.direction || ''}</TableCell>
				<TableCell>{formatDate(device.bornDate) || ''}</TableCell>
				<TableCell>{device.currency || ''}</TableCell>
				<TableCell>{device.purchases || ''}</TableCell>
				<TableCell>{device.lastPurchase || ''}</TableCell>
				<TableCell>{formatDate(device.created_at) || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ComputersForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Borrar proveedor"
	deleteFunc={async () => {
		await api.delete('/purchases/suppliers', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Proveedor eliminado');
		refetch(['purchases-suppliers']);
		show1 = false;
	}}
/>
