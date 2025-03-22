<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { formatDate, getWeekDays } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { Book, BookOpen, Pen } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import ProductivityForm from './ProductivityForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';

	let productivity: any[] = [];
	let separatedProductivity: any = $state({});
	let show = $state(false);
	let areas: any = $state({});
	let positions: any = $state({});
	let incidences: any = $state({});
	let incidencesList: any = [];
	let dateSelected: any = $state(new Date().toISOString().split('T')[0]);
	let viewComplete = $state(false);
	let weekDays: string[] = $state([]);

	async function getProductivity() {
		productivity = (await api.get('/productivity/' + dateSelected)).data;

		productivity = productivity.map((row) => {
			const codes = [
				row['0goal2'] ? 3 : row['0goal1'] ? 2 : row['0goal0'] ? 1 : 1,
				row['1goal2'] ? 3 : row['1goal1'] ? 2 : row['1goal0'] ? 1 : 1,
				row['2goal2'] ? 3 : row['2goal1'] ? 2 : row['2goal0'] ? 1 : 1,
				row['3goal2'] ? 3 : row['3goal1'] ? 2 : row['3goal0'] ? 1 : 1,
				row['4goal2'] ? 3 : row['4goal1'] ? 2 : row['4goal0'] ? 1 : 1
			];
			return {
				...row,
				'0average': Math.round(
					(((parseInt(row['0produced0']) || 0) / (parseInt(row['0goal0']) || 1) +
						(parseInt(row['0produced1']) || 0) / (parseInt(row['0goal1']) || 1) +
						(parseInt(row['0produced2']) || 0) / (parseInt(row['0goal2']) || 1)) /
						codes[0]) *
						100
				),
				'1average': Math.round(
					(((parseInt(row['1produced0']) || 0) / (parseInt(row['1goal0']) || 1) +
						(parseInt(row['1produced1']) || 0) / (parseInt(row['1goal1']) || 1) +
						(parseInt(row['1produced2']) || 0) / (parseInt(row['1goal2']) || 1)) /
						codes[1]) *
						100
				),
				'2average': Math.round(
					(((parseInt(row['2produced0']) || 0) / (parseInt(row['2goal0']) || 1) +
						(parseInt(row['2produced1']) || 0) / (parseInt(row['2goal1']) || 1) +
						(parseInt(row['2produced2']) || 0) / (parseInt(row['2goal2']) || 1)) /
						codes[2]) *
						100
				),
				'3average': Math.round(
					(((parseInt(row['3produced0']) || 0) / (parseInt(row['3goal0']) || 1) +
						(parseInt(row['3produced1']) || 0) / (parseInt(row['3goal1']) || 1) +
						(parseInt(row['3produced2']) || 0) / (parseInt(row['3goal2']) || 1)) /
						codes[3]) *
						100
				),
				'4average': Math.round(
					(((parseInt(row['4produced0']) || 0) / (parseInt(row['4goal0']) || 1) +
						(parseInt(row['4produced1']) || 0) / (parseInt(row['4goal1']) || 1) +
						(parseInt(row['4produced2']) || 0) / (parseInt(row['4goal2']) || 1)) /
						codes[4]) *
						100
				)
			};
		});

		separatedProductivity = {};
		productivity.map((row) => {
			if (!separatedProductivity[row.areaId]) separatedProductivity[row.areaId] = [];
			separatedProductivity[row.areaId].push(row);
		});

		const mondayDate = new Date(getWeekDays(dateSelected)[0]);

		weekDays = [];
		for (let i = 0; i < 5; i++) {
			mondayDate.setDate(mondayDate.getDate() + (i > 0 ? 1 : 0));
			weekDays.push(formatDate(mondayDate.toISOString().split('T')[0]));
		}
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
	}

	function getColors(number: number) {
		if (number < 51) return 'red';
		if (number < 100) return 'yellow';
		if (number < 150) return 'green';
		return 'blue';
	}

	onMount(() => {
		fetchOptions();
		getProductivity();
	});
</script>

<MenuBar>
	{#snippet left()}
		<Input menu type="date" bind:value={dateSelected} onchange={getProductivity} />
		{#if viewComplete}
			<Button class="flex-none" variant="outline" onclick={() => (viewComplete = !viewComplete)}
				><Book class=" size-3.5" />Ver resumen</Button
			>
		{:else}
			<Button class="flex-none" variant="outline" onclick={() => (viewComplete = !viewComplete)}
				><BookOpen class=" size-3.5" />Ver todo</Button
			>
		{/if}
	{/snippet}
	{#snippet right()}
		<Button onclick={() => (show = true)}><Pen class=" size-3.5" />Capturar</Button>
		<!-- <ExportProductivity productivity={separatedProductivity} {areas} {positions} {weekDays} /> -->
	{/snippet}
</MenuBar>

<CusTable>
	{#each Object.keys(separatedProductivity) as areaId, i}
		<TableHeader class=" text-md sticky top-0 z-30 text-left uppercase ">
			<TableHead colspan={100} class="bg-foreground text-background font-semibold"
				>{areas[areaId]}</TableHead
			>
		</TableHeader>
		<TableHeader class="relative z-20  text-center text-xs uppercase ">
			<TableHead colspan={4}>Semana</TableHead>

			{#each weekDays as day}
				<TableHead colspan={viewComplete ? 12 : 1}>{day}</TableHead>
			{/each}
		</TableHeader>

		{#if viewComplete}
			<TableHeader class="z-20  text-xs uppercase ">
				<TableHead colspan={4}></TableHead>

				{#each weekDays as day}
					{#if viewComplete}
						<TableHead></TableHead>
						<TableHead colspan={3}>Operacion 1</TableHead>
						<TableHead colspan={3}>Operacion 2</TableHead>
						<TableHead colspan={3}>Operacion 3</TableHead>
					{/if}
					<TableHead colspan={viewComplete ? 2 : 1}></TableHead>
				{/each}
			</TableHeader>
		{/if}

		<TableHeader class="z-20  text-xs uppercase ">
			<TableHead rowspan={3}>Promedio</TableHead>
			<TableHead rowspan={2}>No. Empleado</TableHead>
			<TableHead rowspan={2} class="w-full">Nombre</TableHead>
			<TableHead rowspan={2}>Posicion</TableHead>

			{#each weekDays as day}
				{#if viewComplete}
					<TableHead>Incidencia</TableHead>
					<TableHead>Codigo</TableHead>
					<TableHead>Meta</TableHead>
					<TableHead>Producido</TableHead>
					<TableHead>Codigo</TableHead>
					<TableHead>Meta</TableHead>
					<TableHead>Producido</TableHead>
					<TableHead>Codigo</TableHead>
					<TableHead>Meta</TableHead>
					<TableHead>Producido</TableHead>
					<TableHead>Comentario</TableHead>
				{/if}
				<TableHead>Promedio</TableHead>
			{/each}
		</TableHeader>
		<TableBody>
			{#each separatedProductivity[areaId] as row}
				<TableRow>
					<TableCell
						><Badge
							color={getColors(
								(row['0average'] +
									row['1average'] +
									row['2average'] +
									row['3average'] +
									row['4average']) /
									5
							)}
							>{(row['0average'] +
								row['1average'] +
								row['2average'] +
								row['3average'] +
								row['4average']) /
								5}%</Badge
						></TableCell
					>
					<TableCell>{row.noEmpleado}</TableCell>
					<TableCell>{row.name}</TableCell>
					<TableCell
						><Badge color={positions[row.positionId || '']?.color}
							>{positions[row.positionId || '']?.name || ''}</Badge
						></TableCell
					>

					{#each weekDays as day, j}
						{#if viewComplete}
							<TableCell>{incidences[row['incidenceId' + j] || '']}</TableCell>
							<TableCell>{row[j + 'code0'] || ''}</TableCell>
							<TableCell>{row[j + 'goal0'] || ''}</TableCell>
							<TableCell>{row[j + 'produced0'] || ''}</TableCell>

							<TableCell>{row[j + 'code1'] || ''}</TableCell>
							<TableCell>{row[j + 'goal1'] || ''}</TableCell>
							<TableCell>{row[j + 'produced1'] || ''}</TableCell>

							<TableCell>{row[j + 'code2'] || ''}</TableCell>
							<TableCell>{row[j + 'goal2'] || ''}</TableCell>
							<TableCell>{row[j + 'produced2'] || ''}</TableCell>

							<TableCell>{row[j + 'comment'] || ''}</TableCell>
						{/if}
						<TableCell
							><Badge color={getColors(row[j + 'average'])}>{row[j + 'average']}%</Badge></TableCell
						>
					{/each}
				</TableRow>
			{/each}
		</TableBody>
	{/each}
</CusTable>

<ProductivityForm bind:show productivity={separatedProductivity} {areas} reload={getProductivity} />
