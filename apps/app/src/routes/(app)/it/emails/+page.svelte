<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { onMount } from 'svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import EmailsForm from './EmailsForm.svelte';
	import PwCell from '$lib/components/ui/table/pw-cell.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedDevice: any = $state({});

	let devices: any[] = $state([]);

	async function getEmails() {
		const result = await api.get('/emails');
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
		getEmails();
	});
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir correo</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		<TableHead class="w-[80%]">Correo</TableHead>
		<TableHead class="w-[30%]">Contraseña</TableHead>
	</TableHeader>
	<TableBody>
		{#each devices as device, i}
			<TableRow>
				<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				<TableCell class="w-full">{device.email || ''}</TableCell>
				<PwCell password={device.password || ''}></PwCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<EmailsForm bind:show bind:selectedDevice reload={getEmails} />
<DeletePopUp
	bind:show={show1}
	text="Borrar correo"
	deleteFunc={async () => {
		await api.delete('/emails', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Correo eliminada');
		await getEmails();
		show1 = false;
	}}
/>
