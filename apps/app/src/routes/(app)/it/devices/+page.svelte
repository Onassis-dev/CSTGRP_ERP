<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { EllipsisVertical, Pen, PlusCircle, Trash } from 'lucide-svelte';
	import DevicesForm from './DevicesForm.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { onMount } from 'svelte';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { showSuccess } from '$lib/utils/showToast';
	import PwCell from '$lib/components/ui/table/pw-cell.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	let devices: any[] = $state([]);

	async function getDevices() {
		const result = await api.get('/devices');
		devices = result.data;
	}

	function editDevice(i: number) {
		selectedDevice = devices[i];
		show = true;
	}
	function createDevice() {
		selectedDevice = {};
		show = true;
	}
	function deleteDevice(i: number) {
		selectedDevice = devices[i];
		show1 = true;
	}

	onMount(() => {
		getDevices();
	});
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir dispositivo</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		<TableHead class="w-[20%]">Nombre</TableHead>
		<TableHead class="w-[20%]">Ip</TableHead>
		<TableHead class="w-[20%]">Usuario</TableHead>
		<TableHead class="w-[20%]">Contrasena</TableHead>
		<TableHead class="w-[20%]">Wifi</TableHead>
	</TableHeader>
	<TableBody>
		{#each devices as device, i}
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

<DevicesForm bind:show bind:selectedDevice reload={getDevices} />
<DeletePopUp
	bind:show={show1}
	text="Borrar Dispositivo"
	deleteFunc={async () => {
		await api.delete('devices', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Dispositivo eliminado');
		show1 = false;
	}}
/>
