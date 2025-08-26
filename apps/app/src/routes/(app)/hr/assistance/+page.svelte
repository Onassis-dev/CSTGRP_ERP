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
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { downloadFile } from '$lib/utils/files';
	import { userData } from '$lib/utils/store';
	import { createQuery } from '@tanstack/svelte-query';
	import {
		getAllOptions,
		getAssistanceAreas,
		getIncidences,
		getOptions,
		getPositions,
		getAreas
	} from '$lib/utils/queries';
	import AssistanceSelect from './AssistanceSelect.svelte';
	import { refetch } from '$lib/utils/query';

	let assistances: any[] = $state([]);
	let filteredAssistances: any[] = $state([]);
	let dateSelected: any = $state(new Date().toISOString().split('T')[0]);
	let areaSelected: string = $state('');

	function filterAssistances() {
		filteredAssistances = assistances.filter((e) => {
			return Number(e.areaId) === Number(areaSelected);
		});
	}

	const positionQuery = createQuery({
		queryKey: ['assistance-week'],
		queryFn: async () => {
			console.log('refetching');
			assistances = (await api.get('/assistance/week/' + dateSelected)).data;
			filterAssistances();
		},
		refetchInterval: 6000
	});

	$positionQuery.data;

	const positionsQuery = createQuery({ queryKey: ['positions'], queryFn: getPositions });
	const incidencesQuery = createQuery({ queryKey: ['incidences'], queryFn: getIncidences });

	const assistanceAreasQuery = createQuery({
		queryKey: ['assistance-areas'],
		queryFn: getAssistanceAreas
	});
	const areasQuery = createQuery({
		queryKey: ['areas'],
		queryFn: getAreas
	});

	let incidences = $derived(getAllOptions($incidencesQuery.data));
	let assistanceAreas = $derived(getOptions($assistanceAreasQuery.data));
	let areas = $derived(getOptions($areasQuery.data));

	async function editAssistance(i: number) {
		await api.put('assistance', {
			...filteredAssistances[i],
			id: parseInt(filteredAssistances[i].id || ''),
			incidenceId0: parseInt(filteredAssistances[i].incidenceId0 || ''),
			incidenceId1: parseInt(filteredAssistances[i].incidenceId1 || ''),
			incidenceId2: parseInt(filteredAssistances[i].incidenceId2 || ''),
			incidenceId3: parseInt(filteredAssistances[i].incidenceId3 || ''),
			incidenceId4: parseInt(filteredAssistances[i].incidenceId4 || ''),
			areaId0: parseInt(filteredAssistances[i].areaId0 || ''),
			areaId1: parseInt(filteredAssistances[i].areaId1 || ''),
			areaId2: parseInt(filteredAssistances[i].areaId2 || ''),
			areaId3: parseInt(filteredAssistances[i].areaId3 || ''),
			areaId4: parseInt(filteredAssistances[i].areaId4 || '')
		});
	}

	async function createWeek() {
		await api.post('/assistance', {
			date: dateSelected
		});
		showSuccess('Semana generada');
		refetch(['assistance-week']);
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
</script>

<MenuBar>
	{#snippet left()}
		<Select
			menu
			class="w-72"
			placeholder="Eligir Area"
			items={assistanceAreas}
			bind:value={areaSelected}
			onValueChange={() => filterAssistances()}
		/>
		<Input
			menu
			type="date"
			bind:value={dateSelected}
			onchange={() => refetch(['assistance-week'])}
			class="max-w-36"
		/>
	{/snippet}
	{#snippet right()}
		{#if $userData?.permissions.assistance === 3}
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
					><Badge color={$positionsQuery.data?.[assistance.positionId]?.color}
						>{$positionsQuery.data?.[assistance.positionId]?.name || ''}</Badge
					></TableCell
				>
				<TableCell class="p-[1px] py-[2px]">
					<AssistanceSelect
						{areas}
						{incidences}
						bind:areaId={filteredAssistances[i].areaId0}
						bind:value={filteredAssistances[i].incidenceId0}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<AssistanceSelect
						{areas}
						{incidences}
						bind:areaId={filteredAssistances[i].areaId1}
						bind:value={filteredAssistances[i].incidenceId1}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<AssistanceSelect
						{areas}
						{incidences}
						bind:areaId={filteredAssistances[i].areaId2}
						bind:value={filteredAssistances[i].incidenceId2}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<AssistanceSelect
						{areas}
						{incidences}
						bind:areaId={filteredAssistances[i].areaId3}
						bind:value={filteredAssistances[i].incidenceId3}
						onValueChange={() => editAssistance(i)}
					/>
				</TableCell>
				<TableCell class="p-[1px] py-[2px]">
					<AssistanceSelect
						{areas}
						{incidences}
						bind:areaId={filteredAssistances[i].areaId4}
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
