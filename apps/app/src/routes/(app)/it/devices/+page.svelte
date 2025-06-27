<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DevicesForm from './DevicesForm.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import PwCell from '$lib/components/ui/table/pw-cell.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	const devices = createQuery({
		queryKey: ['devices'],
		queryFn: async () => (await api.get('/devices')).data
	});

	function editDevice(i: number) {
		selectedDevice = $devices?.data?.[i];
		show = true;
	}
	function createDevice() {
		selectedDevice = {};
		show = true;
	}
	function deleteDevice(i: number) {
		selectedDevice = $devices?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createDevice} size="action"
			><PlusCircle class=" size-3.5" />Añadir dispositivo</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[20%]">Nombre</TableHead>
		<TableHead class="w-[20%]">Ip</TableHead>
		<TableHead class="w-[20%]">Usuario</TableHead>
		<TableHead class="w-[20%]">Contrasena</TableHead>
		<TableHead class="w-[20%]">Wifi</TableHead>
	</TableHeader>
	<TableBody>
		{#each $devices?.data as device, i}
			<TableRow>
				<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				<TableCell>{device.name || ''}</TableCell>
				<TableCell>{device.ip || ''}</TableCell>
				<TableCell>{device.user || ''}</TableCell>
				<PwCell password={device.password || ''}></PwCell>
				<PwCell password={device.wifipw || ''}></PwCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DevicesForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Eliminar dispositivo"
	deleteFunc={async () => {
		await api.delete('devices', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Dispositivo eliminado');
		show1 = false;
	}}
/>
