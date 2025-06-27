<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import ComputersForm from './ComputersForm.svelte';
	import { formatDate } from '$lib/utils/functions';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import PwCell from '$lib/components/ui/table/pw-cell.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	const computers = createQuery({
		queryKey: ['computers'],
		queryFn: async () => (await api.get('/computers')).data
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
		<Button onclick={createDevice} size="action"
			><PlusCircle class=" size-3.5" />Añadir computadora</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[13%]">Nombre</TableHead>
		<TableHead class="w-[12.5%]">Usuario</TableHead>
		<TableHead class="w-[12.5%]">Anydesk</TableHead>
		<TableHead class="w-[12.5%]">Anydesk PW</TableHead>
		<TableHead class="w-[12.5%]">PW</TableHead>
		<TableHead class="w-[12.5%]">Activa</TableHead>
		<TableHead class="w-[12.5%]">Ultimo mantenimiento</TableHead>
		<TableHead class="w-[12.5%]">Proximo mantenimiento</TableHead>
	</TableHeader>
	<TableBody>
		{#each $computers?.data as device, i}
			<TableRow>
				<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				<TableCell>{device.name || ''}</TableCell>
				<TableCell>{device.owner || ''}</TableCell>
				<TableCell>{device.anydesk || ''}</TableCell>
				<PwCell password={device.anydeskPW || ''}></PwCell>
				<PwCell password={device.password || ''}></PwCell>
				<TableCell
					><Badge color={device.active ? 'green' : 'gray'}
						>{device.active ? 'Activo' : 'Inactivo'}</Badge
					></TableCell
				>
				<TableCell>{formatDate(device.lastMaintance) || ''}</TableCell>
				<TableCell>
					{#if device.lastMaintance}
						{formatDate(
							new Date(
								new Date(device.lastMaintance).setMonth(
									new Date(device.lastMaintance).getMonth() + 6
								)
							).toISOString()
						)}
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ComputersForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Eliminar computadora"
	deleteFunc={async () => {
		await api.delete('/computers', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Computadora eliminada');
		refetch(['computers']);
		show1 = false;
	}}
/>
