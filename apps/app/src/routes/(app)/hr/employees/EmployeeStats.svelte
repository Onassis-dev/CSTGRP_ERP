<script lang="ts">
	import { run } from 'svelte/legacy';

	import LineChart from '$lib/components/charts/LineChart.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { formatDate } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import AssistanceCube from './AssistanceCube.svelte';

	interface Props {
		employee: any;
	}

	let { employee = $bindable() }: Props = $props();

	let assistance: any[] = $state([]);
	let productivity: any[] = $state([]);

	const fetchData = async () => {
		const assistanceInfo = (await api.get(`/employees/assistance/${employee.id}`)).data;

		assistanceInfo.map((e: any) => {
			e.mondayDate = e.mondayDate;
		});

		assistance = assistanceInfo;

		const productivityInfo = (await api.get(`/employees/productivity/${employee.id}`)).data;
		productivity = [];
		productivityInfo.forEach((e: any) => {
			const codes = [
				e['0goal2'] ? 3 : e['0goal1'] ? 2 : e['0goal0'] ? 1 : 1,
				e['1goal2'] ? 3 : e['1goal1'] ? 2 : e['1goal0'] ? 1 : 1,
				e['2goal2'] ? 3 : e['2goal1'] ? 2 : e['2goal0'] ? 1 : 1,
				e['3goal2'] ? 3 : e['3goal1'] ? 2 : e['3goal0'] ? 1 : 1,
				e['4goal2'] ? 3 : e['4goal1'] ? 2 : e['4goal0'] ? 1 : 1
			];
			const averages = {
				0: Math.round(
					(((parseInt(e['0produced0']) || 0) / (parseInt(e['0goal0']) || 1) +
						(parseInt(e['0produced1']) || 0) / (parseInt(e['0goal1']) || 1) +
						(parseInt(e['0produced2']) || 0) / (parseInt(e['0goal2']) || 1)) /
						codes[0]) *
						100
				),
				1: Math.round(
					(((parseInt(e['1produced0']) || 0) / (parseInt(e['1goal0']) || 1) +
						(parseInt(e['1produced1']) || 0) / (parseInt(e['1goal1']) || 1) +
						(parseInt(e['1produced2']) || 0) / (parseInt(e['1goal2']) || 1)) /
						codes[1]) *
						100
				),
				2: Math.round(
					(((parseInt(e['2produced0']) || 0) / (parseInt(e['2goal0']) || 1) +
						(parseInt(e['2produced1']) || 0) / (parseInt(e['2goal1']) || 1) +
						(parseInt(e['2produced2']) || 0) / (parseInt(e['2goal2']) || 1)) /
						codes[2]) *
						100
				),
				3: Math.round(
					(((parseInt(e['3produced0']) || 0) / (parseInt(e['3goal0']) || 1) +
						(parseInt(e['3produced1']) || 0) / (parseInt(e['3goal1']) || 1) +
						(parseInt(e['3produced2']) || 0) / (parseInt(e['3goal2']) || 1)) /
						codes[3]) *
						100
				),
				4: Math.round(
					(((parseInt(e['4produced0']) || 0) / (parseInt(e['4goal0']) || 1) +
						(parseInt(e['4produced1']) || 0) / (parseInt(e['4goal1']) || 1) +
						(parseInt(e['4produced2']) || 0) / (parseInt(e['4goal2']) || 1)) /
						codes[4]) *
						100
				)
			};

			productivity.push({
				name: formatDate(e.mondayDate),
				value: (averages[0] + averages[1] + averages[2] + averages[3] + averages[4]) / 5
			});
		});
	};

	function getWeekNumber(date: any) {
		date = new Date(date);
		const startOfYear = new Date(date.getFullYear(), 0, 1);
		const diff = (date as any) - (startOfYear as any);
		return Math.ceil((diff / (1000 * 60 * 60 * 24) + startOfYear.getDay() + 1) / 7);
	}

	run(() => {
		if (employee.id) fetchData();
	});
</script>

<div class="border-primary-500 my-2 w-full border-b">Asistencia</div>

<div
	class="grid w-full grid-flow-col grid-cols-[auto_repeat(32,_1fr)] grid-rows-[auto_repeat(5,_1fr)] gap-1.5"
>
	<p></p>
	<p class="mr-3 text-xs font-medium text-gray-500">Lunes</p>
	<p class="mr-3 text-xs font-medium text-gray-500">Martes</p>
	<p class="mr-3 text-xs font-medium text-gray-500">Miercoles</p>
	<p class="mr-3 text-xs font-medium text-gray-500">Jueves</p>
	<p class="mr-3 text-xs font-medium text-gray-500">Viernes</p>
	{#each assistance as day}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<p class="text-xs font-medium text-gray-500">{getWeekNumber(day.mondayDate)}</p>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>{formatDate(day.mondayDate)}</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
		<AssistanceCube incidence={day.incidence0} />
		<AssistanceCube incidence={day.incidence1} />
		<AssistanceCube incidence={day.incidence2} />
		<AssistanceCube incidence={day.incidence3} />
		<AssistanceCube incidence={day.incidence4} />
	{/each}
</div>

<div class="border-primary-500 my-2 mt-12 w-full border-b">Productividad</div>
<div class="h-48">
	<LineChart
		data={productivity || []}
		color="blue"
		label="Productividad"
		maxValue={99}
		minValue={0}
		stepSize={20}
	/>
</div>
