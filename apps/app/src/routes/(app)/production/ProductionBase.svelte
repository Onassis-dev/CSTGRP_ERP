<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { formatDate } from '$lib/utils/functions';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { refetch } from '$lib/utils/query';
	import Select from '$lib/components/basic/Select.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { PlusCircle } from 'lucide-svelte';
	import ProgressForm from './ProgressForm.svelte';
	import MovementCard from './MovementCard.svelte';

	interface Props {
		area: string;
	}

	const completed = [
		{ name: 'Completado', value: 'true', color: 'green' },
		{ name: 'Pendiente', value: 'false', color: 'yellow' }
	];

	let { area }: Props = $props();
	let filters = $state({
		area,
		job: '',
		programation: '',
		completed: 'false'
	});

	let show: boolean = $state(false);
	let show2: boolean = $state(false);
	let selectedOrder: any = $state(null);

	const orders = createQuery({
		queryKey: ['orders', { ...filters }],
		queryFn: async () =>
			(
				await api.get(`/progress`, {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['orders', { area }]);
	});
</script>

<MenuBar>
	<div class="flex flex-col gap-1.5 lg:flex-row">
		<Input menu bind:value={filters.programation} placeholder="Programación" class="max-w-32" />
		<Input menu bind:value={filters.job} placeholder="Job" class="max-w-32" />
		<Select menu items={completed} bind:value={filters.completed} class="min-w-36 max-w-36" />
	</div>
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-1/6">Job/PO</TableHead>
		<TableHead class="w-1/6">Programacion</TableHead>
		<TableHead class="w-1/6">Parte</TableHead>
		<TableHead class="w-1/6">Completado</TableHead>
		<TableHead class="w-1/6">Cantidad</TableHead>
		<TableHead class="w-1/6">Faltante</TableHead>
		<TableHead class="w-1/6">Fecha</TableHead>
	</TableHeader>
	<TableBody>
		{#each $orders?.data as device, i}
			<TableRow>
				<OptionsCell
					viewFunc={() => {
						selectedOrder = device;
						show = true;
					}}
					extraButtons={[
						{
							name: 'Capturar',
							icon: PlusCircle,
							fn: () => {
								selectedOrder = device;
								show2 = true;
							}
						}
					]}
				/>
				<TableCell>{device.jobpo}</TableCell>
				<TableCell>{device.programation}</TableCell>
				<TableCell>{device.part}</TableCell>
				<TableCell>{device[area]}</TableCell>
				<TableCell>{device.amount}</TableCell>
				<TableCell>{device.amount - device[area]}</TableCell>
				<TableCell>{formatDate(device.created_at)}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<MovementCard bind:show bind:selectedOrder {area} />
<ProgressForm bind:show={show2} bind:selectedOrder {area} />
