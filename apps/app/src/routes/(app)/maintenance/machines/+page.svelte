<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle, Wrench } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import MachinesForm from './MachinesForm.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { getAreas, getOptions } from '$lib/utils/queries';
	import { Input } from '$lib/components/ui/input';
	import Select from '$lib/components/basic/Select.svelte';
	import MaintenanceCard from './MaintenanceCard.svelte';

	let show = $state(false);
	let show1 = $state(false);
	let showCard = $state(false);
	let selectedDevice: any = $state({});

	let searchParams = $state({
		publicId: '',
		areaId: ''
	});
	let searchActive: boolean = $state(true);

	const machines = createQuery({
		queryKey: ['machines'],
		queryFn: async () =>
			(await api.get('/maintenance/machines', { params: { active: searchActive } })).data
	});

	const areas = createQuery({
		queryKey: ['maintenance-areas'],
		queryFn: getAreas
	});

	function editDevice(i: number) {
		selectedDevice = filteredMachines[i];
		show = true;
	}
	function createDevice() {
		selectedDevice = {};
		show = true;
	}
	function deleteDevice(i: number) {
		selectedDevice = filteredMachines[i];
		show1 = true;
	}

	let filteredMachines = $derived(
		$machines?.data?.filter((m: any) => {
			const idMatch = searchParams.publicId
				? m.publicId?.toUpperCase()?.includes(searchParams.publicId.toUpperCase())
				: true;
			const areaMatch = searchParams.areaId ? m.areaId === searchParams.areaId : true;
			return idMatch && areaMatch;
		})
	);
</script>

<MenuBar>
	{#snippet left()}
		<Input menu bind:value={searchParams.publicId} placeholder="ID" class="w-28" />

		<Select
			menu
			allowDeselect
			bind:value={searchParams.areaId}
			items={getOptions($areas.data)}
			placeholder="Área"
			class="min-w-48"
		></Select>

		<Select
			class="min-w-28"
			menu
			value={searchActive.toString()}
			onValueChange={() => {
				searchActive = !searchActive;
				refetch(['machines']);
			}}
			items={[
				{ name: 'Activas', value: 'true', color: 'green' },
				{ name: 'Inactivas', value: 'false', color: 'red' }
			]}
		></Select>
	{/snippet}
	{#snippet right()}
		<Button onclick={createDevice} size="action"
			><PlusCircle class=" size-3.5" />Añadir máquina</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-1/2">ID</TableHead>
		<TableHead class="w-1/2">Marca</TableHead>
		<TableHead class="">Modelo</TableHead>
		<TableHead class="">Serial</TableHead>
		<TableHead class="">Pedimento</TableHead>
		<TableHead class="">Área</TableHead>
		<TableHead class="">Activa</TableHead>
	</TableHeader>
	<TableBody>
		{#each filteredMachines as machine, i}
			<TableRow>
				<OptionsCell
					editFunc={() => editDevice(i)}
					deleteFunc={() => deleteDevice(i)}
					extraButtons={[
						{
							fn: () => {
								selectedDevice = machine;
								showCard = true;
							},
							name: 'Mantenimientos',
							icon: Wrench
						}
					]}
				/>
				<TableCell>{machine.publicId || ''}</TableCell>
				<TableCell>{machine.brand || ''}</TableCell>
				<TableCell>{machine.model || ''}</TableCell>
				<TableCell>{machine.serial || ''}</TableCell>
				<TableCell>{machine.pediment || ''}</TableCell>
				<TableCell
					><Badge color={$areas.data?.[machine.areaId || '']?.color}
						>{$areas.data?.[machine.areaId || '']?.name}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={machine.active === 'true' ? 'green' : 'gray'}
						>{machine.active === 'true' ? 'Activo' : 'Inactivo'}</Badge
					></TableCell
				>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<MachinesForm bind:show bind:selectedDevice />
<DeletePopUp
	bind:show={show1}
	text="Eliminar máquina"
	deleteFunc={async () => {
		await api.delete('/maintenance/machines', { data: { id: parseInt(selectedDevice.id || '') } });
		showSuccess('Máquina eliminada');
		refetch(['machines']);
		show1 = false;
	}}
/>
<MaintenanceCard bind:show={showCard} selectedMachine={selectedDevice} />
