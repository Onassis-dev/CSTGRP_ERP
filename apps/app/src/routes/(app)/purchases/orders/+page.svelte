<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { Copy, FileDown, PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import ComputersForm from './OrdersForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { formatDate } from '$lib/utils/functions';
	import { downloadFile } from '$lib/utils/files';
	import { Input } from '$lib/components/ui/input';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let searchParams: any = $state({
		name: ''
	});

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	const computers = createQuery({
		queryKey: ['purchases-orders'],
		queryFn: async () => (await api.get('/purchases/orders', { params: searchParams })).data
	});

	function editDevice(i: number) {
		selectedDevice = $computers?.data?.[i];
		show = true;
	}

	function duplicateDevice(i: number) {
		selectedDevice = { ...$computers?.data?.[i], folio: '', id: null };
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
			oninput={() => refetch(['purchases-orders'])}
		/>
	{/snippet}
	{#snippet right()}
		<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Crear orden</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="">Folio</TableHead>
		<TableHead class="w-full">Proveedor</TableHead>
		<TableHead class="">Neto</TableHead>
		<TableHead class="">Impuesto</TableHead>
		<TableHead class="">Total</TableHead>
		<TableHead class="">Fecha</TableHead>
	</TableHeader>
	<TableBody>
		{#each $computers?.data as device, i}
			<TableRow>
				<OptionsCell
					editFunc={() => editDevice(i)}
					deleteFunc={() => deleteDevice(i)}
					extraButtons={[
						{
							fn: () => {
								downloadFile({
									url: '/purchases/orders/download/' + device.id,
									name: 'oc-' + device.folio + '.pdf'
								});
							},
							name: 'Descargar',
							icon: FileDown
						},
						{
							fn: () => {
								duplicateDevice(i);
							},
							name: 'Duplicar',
							icon: Copy
						}
					]}
				/>
				<TableCell>{device.folio || ''}</TableCell>
				<TableCell>{device.supplier || ''}</TableCell>
				<TableCell>{device.net || ''}</TableCell>
				<TableCell>{device.tax || ''}</TableCell>
				<TableCell>{device.total || ''}</TableCell>
				<TableCell>{formatDate(device.created_at) || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ComputersForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Borrar orden"
	deleteFunc={async () => {
		await api.delete('/purchases/orders', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Orden eliminada');
		refetch(['purchases-orders']);
		show1 = false;
	}}
/>
