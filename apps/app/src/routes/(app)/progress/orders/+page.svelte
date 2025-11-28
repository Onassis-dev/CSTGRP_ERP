<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Input from '$lib/components/ui/input/input.svelte';
	import { getClients, getOptions } from '$lib/utils/queries';
	import { formatDate } from '$lib/utils/functions';
	import { refetch } from '$lib/utils/query';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { PlusCircle, History } from 'lucide-svelte';
	import ProgressForm from './ProgressForm.svelte';
	import HistoryCard from './historyCard.svelte';

	let selectedRow: any = $state({});

	let showForm = $state(false);
	let showHistory = $state(false);

	let filters = $state({
		programation: '',
		jobpo: '',
		clientId: ''
	});

	const orders = createQuery({
		queryKey: ['progress-orders'],
		queryFn: async () =>
			(
				await api.get(`/progress/orders`, {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['progress-orders']);
	});

	const clients = createQuery({
		queryKey: ['clients'],
		queryFn: getClients
	});

	const clientsQuery = $derived(getOptions($clients.data));

	function formatNumber(value: number, decimals: number = 2) {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(Number(value));
	}
</script>

<MenuBar>
	<div class="flex flex-col gap-1.5 lg:flex-row">
		<Input menu bind:value={filters.programation} placeholder="Programación" class="max-w-32" />
		<Input menu bind:value={filters.jobpo} placeholder="Job" class="max-w-32" />
		<Select
			placeholder="Cliente"
			menu
			items={clientsQuery}
			bind:value={filters.clientId}
			allowDeselect
			class="w-40"
		/>
	</div>
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />

		<TableHead class="w-[25%]">Programación</TableHead>
		<TableHead class="w-[25%]">Job</TableHead>
		<TableHead class="w-[100%]">Parte</TableHead>
		<TableHead class="w-[100%]">Tiempo prod</TableHead>
		<TableHead class="w-[100%]">Restante</TableHead>
		<TableHead class="w-[100%]">Due Date</TableHead>
		<TableHead class="w-[25%]">Cliente</TableHead>
	</TableHeader>
	<TableBody>
		{#each $orders?.data as row, i}
			<TableRow>
				<OptionsCell
					extraButtons={[
						{
							name: 'Capturar',
							icon: PlusCircle,
							fn: () => {
								selectedRow = row;
								showForm = true;
							}
						},
						{
							name: 'Historial',
							icon: History,
							fn: () => {
								selectedRow = row;
								showHistory = true;
							}
						}
					]}
				/>
				<TableCell>{row.programation}</TableCell>
				<TableCell>{row.jobpo}</TableCell>
				<TableCell>{row.part}</TableCell>
				<TableCell>{row.time}</TableCell>
				<TableCell>{row.missing ? Number(Math.abs(row.missing)).toFixed(2) : ''}</TableCell>
				<TableCell>{formatDate(row.due)}</TableCell>
				<TableCell>
					<Badge color={$clients?.data?.[row.clientId]?.color}
						>{$clients?.data?.[row.clientId]?.name}
					</Badge>
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<ProgressForm bind:show={showForm} selectedOrder={selectedRow} />
<!-- <ProgressHistory bind:show={showHistory} selectedOrder={selectedRow} /> -->
<HistoryCard bind:show={showHistory} selectedOrder={selectedRow} />
