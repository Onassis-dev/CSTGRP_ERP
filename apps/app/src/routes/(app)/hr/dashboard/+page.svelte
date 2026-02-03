<script lang="ts">
	import LineChart from '$lib/components/charts/LineChart.svelte';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PieChart from '$lib/components/charts/PieChart.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { formatDate, getImage } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { onMount } from 'svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import DashboardBody from '$lib/components/basic/DashboardBody.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Download } from 'lucide-svelte';

	let employeeTemplate: any = $state();
	let activeEmployees: any = $state();
	let dailyIncidences: any[] = $state([]);
	let areaIncidences: any[] = $state([]);
	let assistance: any[] = $state([]);
	let selectedDate = $state(new Date().toISOString().split('T')[0]);
	let areaSelected = $state('');
	let areas: any[] = $state([]);
	let dailyIncidencesList: any[] = $state([]);
	let birthDays: any[] = $state([]);
	let rotation: number = $state(0);
	let dailyAssistance = $state(0);
	let contractExpiration: any[] = $state([]);

	const contractTypes = {
		0: 'Prueba',
		1: 'Primer contrato',
		2: 'Segundo contrato',
		3: 'Tercer contrato',
		4: 'Base'
	};

	function fetchConstData() {
		api.get('/hrvarious/areas').then((res) => {
			areas = res.data;
			areaSelected = areas.find((area) => area.name.toUpperCase() === 'ADMINISTRACION').value;
		});
		api.get('/hrstats/employeetemplate').then((res) => (employeeTemplate = res.data[0].value));
		api.get('/hrstats/activeemployees').then((res) => (activeEmployees = res.data[0].count));
		api.get('/hrstats/contractexpiration').then((res) => (contractExpiration = res.data));
		getDailyData();
	}

	function getDailyData() {
		api.get('/hrstats/assistance/' + selectedDate).then((res) => (assistance = res.data));
		api.get('/hrstats/employeerotation/' + selectedDate).then((res) => (rotation = res.data));
		api.get('/hrstats/assistanceinfo/' + selectedDate).then((res) => (dailyIncidences = res.data));
		api.get('/hrstats/dailyassistance/' + selectedDate).then((res) => (dailyAssistance = res.data));
		api
			.get(`/hrstats/areaassistanceinfo?areaId=${areaSelected}&date=${selectedDate}`)
			.then((res) => (areaIncidences = res.data));
		api
			.get(`/hrstats/dailyincidenceslist/${selectedDate}`)
			.then((res) => (dailyIncidencesList = res.data));
		api.get(`/hrstats/birthdays/${selectedDate}`).then((res) => (birthDays = res.data));
	}

	async function refetchAreaIncidences() {
		areaIncidences = (
			await api.get(`/hrstats/areaassistanceinfo?areaId=${areaSelected}&date=${selectedDate}`)
		).data;
	}

	async function updateTemplate() {
		await api.put('employees/template', { template: parseInt(employeeTemplate) });
		showSuccess('Plantilla actualizada');
	}

	async function getBirthdayPhoto(id: any) {
		const response = await api.get('/hrvarious/birthdayphoto', {
			responseType: 'arraybuffer',
			params: {
				noEmpleado: id
			}
		});

		const blob = new Blob([response.data], { type: 'image/jpeg' });

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.target = '_blank';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	$effect(() => {
		if (areaSelected) refetchAreaIncidences();
	});

	onMount(() => {
		fetchConstData();
	});
</script>

<MenuBar>
	<Input menu class="w-fit" type="date" bind:value={selectedDate} onchange={getDailyData} />
</MenuBar>

<DashboardBody
	title="Recursos Humanos"
	class="grid grid-cols-12 grid-rows-[7rem_19rem_22rem] place-items-stretch gap-4 "
>
	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Asistencia</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="mb-2 flex items-center gap-2">
				<p class="text-2xl font-medium">{dailyAssistance} %</p>
			</div>
			<Progress value={dailyAssistance} />
		</CardContent>
	</Card>

	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Plantilla</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="mb-2 flex items-center gap-2">
				<p class="text-2xl font-medium">{activeEmployees}</p>
				<p class="text-muted-foreground">/</p>
				<Input
					onblur={updateTemplate}
					bind:value={employeeTemplate}
					class="text-muted-foreground border-none p-0"
				/>
			</div>
			<Progress value={(activeEmployees / employeeTemplate) * 100} />
		</CardContent>
	</Card>

	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Rotación anual</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="mb-2 flex items-center gap-2">
				<p class="text-2xl font-medium">{rotation} %</p>
			</div>
			<Progress value={rotation} />
		</CardContent>
	</Card>

	<Card class="col-span-3 row-span-2 flex h-full w-full max-w-full flex-col">
		<CardHeader>
			<CardTitle>Lista de incidencias</CardTitle>
		</CardHeader>
		<CardContent class="max-h-[calc(100%-1.5rem)] px-0" chart>
			<div
				class="grid max-h-full grid-cols-[auto_1fr_auto] place-items-start items-center gap-4 overflow-auto px-4"
			>
				{#each dailyIncidencesList as row}
					<img
						src={getImage(row.photo)}
						alt=""
						loading="lazy"
						class="size-10 rounded-full border object-cover"
					/>
					<p class="text-sm font-medium">{row.name}</p>

					<Badge
						color={row.incidence ? 'green' : 'gray'}
						class="h-min w-min justify-self-end whitespace-nowrap text-sm"
						>{row.incidence || '---'}</Badge
					>
				{/each}
			</div>
		</CardContent>
	</Card>

	<Card class="col-span-9 w-full max-w-full">
		<CardHeader>
			<CardTitle>Asistencia semanal</CardTitle>
		</CardHeader>
		<CardContent chart>
			{#if assistance}
				<LineChart
					label="Asistencia"
					data={assistance}
					color="green"
					minValue={0}
					maxValue={99}
					stepSize={25}
				></LineChart>
			{/if}
		</CardContent>
	</Card>

	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle class="flex justify-between">
				Cumpleaños del mes

				<a
					target="_blank"
					href={`${import.meta.env.VITE_BASEURL}/hrvarious/birthdays?date=${selectedDate}`}
					class="p-1"
				>
					<Download class="size-3.5" />
				</a>
			</CardTitle>
		</CardHeader>
		<CardContent class="max-h-[calc(100%-1.5rem)] px-0" chart>
			<div class="grid max-h-full grid-cols-[auto_1fr_auto] gap-4 overflow-auto px-4">
				{#each birthDays as row}
					<img
						src={getImage(row.photo)}
						alt=""
						loading="lazy"
						class="size-10 rounded-full border object-cover"
					/>
					<div>
						<p class="text-sm font-medium">{row.name}</p>
						<p class="text-muted-foreground text-xs">{formatDate(row.bornDate)}</p>
					</div>
					<div class="p-0">
						<Button size="icon" variant="ghost" onclick={() => getBirthdayPhoto(row.noEmpleado)}>
							<Download class="size-3.5" />
						</Button>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Contratos pendientes</CardTitle>
		</CardHeader>
		<CardContent class="max-h-[calc(100%-1.5rem)] px-0" chart>
			<div class="grid max-h-full grid-cols-[auto_1fr_auto] gap-4 overflow-auto px-4">
				{#each contractExpiration as row}
					<img
						src={getImage(row.photo)}
						alt=""
						loading="lazy"
						class="size-10 rounded-full border object-cover"
					/>
					<div>
						<p class="text-sm font-medium">{row.name}</p>
						<p class="text-muted-foreground text-xs">{formatDate(row.next_renewal_date)}</p>
					</div>
					<div class="p-0 text-sm">
						{contractTypes[row.contract + 1]}
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Incidencias diarias</CardTitle>
		</CardHeader>
		<CardContent chart class="flex flex-col items-center pb-16">
			{#if dailyIncidences[0]}
				<PieChart data={dailyIncidences}></PieChart>
			{/if}
		</CardContent>
	</Card>

	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Incidencias diarias por area</CardTitle>
		</CardHeader>

		<CardContent chart class="flex flex-col items-center pb-16">
			<PieChart data={areaIncidences}></PieChart>
			<Select
				items={areas}
				bind:value={areaSelected}
				placeholder="Selecciona un area"
				class="mt-2"
			/>
		</CardContent>
	</Card>
</DashboardBody>
