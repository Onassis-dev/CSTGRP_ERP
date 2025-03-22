<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Cookies from 'js-cookie';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { onMount } from 'svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import DirectoryForm from './DirectoryForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';

	let show = $state(false);
	let show1 = $state(false);
	let selectedDevice = $state({});

	let devices: any[] = $state([]);

	async function getDevices() {
		devices = (await api.get('/resources/directory')).data;
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

{#if parseInt(Cookies.get('perm_it') || '0') == 2}
	<MenuBar>
		{#snippet right()}
			<Button onclick={createDevice}><PlusCircle class=" size-3.5" />Añadir fila</Button>
		{/snippet}
	</MenuBar>
{/if}

<CusTable>
	<TableHeader>
		{#if parseInt(Cookies.get('perm_it') || '0') == 2}
			<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
		{/if}
		<TableHead class="w-[50%]">Nombre</TableHead>
		<TableHead class="w-[25%]">Posicion</TableHead>
		<TableHead class="w-[25%]">Correo</TableHead>
		<TableHead class="w-[25%]">Extension</TableHead>
	</TableHeader>
	<TableBody>
		{#each devices as device, i}
			<TableRow>
				{#if parseInt(Cookies.get('perm_it') || '0') == 2}
					<OptionsCell editFunc={() => editDevice(i)} deleteFunc={() => deleteDevice(i)} />
				{/if}
				<TableCell>{device.name || ''}</TableCell>
				<TableCell>{device.position || ''}</TableCell>
				<TableCell><a href="mailto:{device.email || ''}">{device.email || ''}</a></TableCell>
				<TableCell>{device.extension || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

{#if parseInt(Cookies.get('perm_it') || '0') == 2}
	<DirectoryForm bind:show bind:selectedDevice reload={getDevices} />
	<DeletePopUp
		bind:show={show1}
		text="Borrar fila"
		deleteFunc={async () => {
			await api.delete('/directory', { data: { id: parseInt((selectedDevice as any).id || '') } });
			showSuccess('Fila eliminada');
			await getDevices();
			show1 = false;
		}}
	/>
{/if}
