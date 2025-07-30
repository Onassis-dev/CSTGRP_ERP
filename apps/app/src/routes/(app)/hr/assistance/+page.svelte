<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { FileDown, PlusCircle } from 'lucide-svelte';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { downloadFile } from '$lib/utils/files';
	import { userData } from '$lib/utils/store';

	let assistances: any[] = $state([]);
	let areas: any = {};
	let positions: any = $state({});
	let incidences: any = {};
	let incidencesList: any = $state([]);
	let areasList: any = $state([]);
	let dateSelected: any = $state(new Date().toISOString().split('T')[0]);
	let areaSelected: string = $state('');

	async function getAssistance() {
		assistances = (await api.get('/assistance/week/' + dateSelected)).data;
	}

	async function fetchOptions() {
		const areasArray = (await api.get('/hrvarious/areas')).data;
		areasArray.forEach((area: any) => {
			areas[area.value] = area.name;
		});
		const positionsArray = (await api.get('/hrvarious/positions')).data;
		positionsArray.forEach((position: any) => {
			positions[position.value] = { name: position.name, color: position.color };
		});
		const incidencesArray = (await api.get('/hrvarious/incidences')).data;
		incidencesArray.forEach((incidence: any) => {
			incidences[incidence.value] = incidence.name;
		});
		incidencesList = incidencesArray;
		if ($userData?.permissions.assistance_areas === 'Todas') return (areasList = areasArray);

		const accessibleAreas = $userData?.permissions.assistance_areas?.split(',');
		areasList = areasArray.filter((area: any) => {
			return accessibleAreas?.includes(area.value);
		});
	}

	let filteredAssistances = $derived(
		assistances.filter((e) => {
			return e.areaId === areaSelected;
		})
	);

	async function editAssistance(i: number) {
		await api.put('assistance', {
			...filteredAssistances[i],
			id: parseInt(filteredAssistances[i].id || ''),
			incidenceId0: parseInt(filteredAssistances[i].incidenceId0 || ''),
			incidenceId1: parseInt(filteredAssistances[i].incidenceId1 || ''),
			incidenceId2: parseInt(filteredAssistances[i].incidenceId2 || ''),
			incidenceId3: parseInt(filteredAssistances[i].incidenceId3 || ''),
			incidenceId4: parseInt(filteredAssistances[i].incidenceId4 || '')
		});
	}

	async function createWeek() {
		await api.post('/assistance', {
			date: dateSelected
		});
		showSuccess('Semana generada');
		getAssistance();
	}

	async function exportList() {
		downloadFile({
			url: '/assistance/export',
			name: 'Lista de asistencia.pdf',
			params: {
				date: dateSelected
			}
		});
	}

	onMount(() => {
		getAssistance();
		fetchOptions();
	});
</script>

<MenuBar>
	{#snippet left()}
		<Select
			menu
			class="w-72"
			placeholder="Eligir Area"
			items={areasList}
			bind:value={areaSelected}
		/>
		<Input menu type="date" bind:value={dateSelected} onchange={getAssistance} class="max-w-36" />
	{/snippet}
	{#snippet right()}
		{#if $userData?.permissions.assistance_areas === 'Todas'}
			<!-- <ExportAssistance date={dateSelected} /> -->
			<Button onclick={exportList} size="icon" variant="outline"
				><FileDown class="size-3.5" /></Button
			>
			<Button onclick={createWeek} size="action"
				><PlusCircle class="size-3.5" />Generar semana</Button
			>
		{/if}
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="w-[1%]">No</TableHead>
		<TableHead class="w-[20%]">Nombre</TableHead>
		<TableHead class="w-[1%]">Posicion</TableHead>
		<TableHead class="w-[10%]">Lunes</TableHead>
		<TableHead class="w-[10%]">Martes</TableHead>
		<TableHead class="w-[10%]">Miercoles</TableHead>
		<TableHead class="w-[10%]">Jueves</TableHead>
		<TableHead class="w-[10%]">Viernes</TableHead>
	</TableHeader>
	<TableBody>
		{#each filteredAssistances as assistance, i}
			<TableRow>
				<TableCell>{assistance.noEmpleado}</TableCell>
				<TableCell>{assistance.name}</TableCell>

				<TableCell
					><Badge color={positions[assistance.positionId || ''].color}
						>{positions[assistance.positionId || ''].name || ''}</Badge
					></TableCell
				>
				<TableCell class="p-[1px] py-[2px]">
					<Select
						class="rounded-none text-xs"
						cell={true}
						items={incidencesList}
						bind:value={filteredAssistances[i].incidenceId0}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<Select
						class="rounded-none text-xs"
						cell={true}
						items={incidencesList}
						bind:value={filteredAssistances[i].incidenceId1}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<Select
						class="rounded-none text-xs"
						cell={true}
						items={incidencesList}
						bind:value={filteredAssistances[i].incidenceId2}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<Select
						class="rounded-none text-xs"
						cell={true}
						items={incidencesList}
						bind:value={filteredAssistances[i].incidenceId3}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<Select
						class="rounded-none text-xs"
						cell={true}
						items={incidencesList}
						bind:value={filteredAssistances[i].incidenceId4}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
			</TableRow>
		{/each}
		{#if !filteredAssistances[0]}
			<TableRow>
				<TableCell class="col-span-9 h-10"></TableCell>
				<TableCell class="col-span-9 h-10"></TableCell>
				<TableCell class="col-span-9 h-10"></TableCell>
				<TableCell class="col-span-9 h-10"></TableCell>
				<TableCell class="col-span-9 h-10"></TableCell>
				<TableCell class="col-span-9 h-10"></TableCell>
			</TableRow>
		{/if}
	</TableBody>
</CusTable>
