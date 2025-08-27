<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import Input from '$lib/components/ui/input/input.svelte';
	import { getClients, getOptions } from '$lib/utils/queries';
	import { formatDate } from '$lib/utils/functions';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { refetch } from '$lib/utils/query';
	import { showSuccess } from '$lib/utils/showToast';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Select from '$lib/components/basic/Select.svelte';

	let selectedRow: any = $state({});
	let show = $state(false);

	let filters = $state({
		programation: '',
		jobpo: '',
		clientId: ''
	});

	const orders = createQuery({
		queryKey: ['reports-orders'],
		queryFn: async () =>
			(
				await api.get(`/reports/production/orders`, {
					params: filters
				})
			).data
	});

	async function checkMovement() {
		try {
			await api.put('/reports/production/orders', {
				id: selectedRow.id
			});
			showSuccess(selectedRow.invoiced ? 'Check eliminado' : 'Check marcado');
			show = false;
			refetch(['reports-orders']);
		} catch (err: any) {
			if (err.response.status !== 400) throw err;
		}
	}

	$effect(() => {
		({ ...filters });
		refetch(['reports-orders']);
	});

	const clients = createQuery({
		queryKey: ['clients'],
		queryFn: getClients
	});

	const clientsQuery = $derived(getOptions($clients.data));
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
		<TableHead class="w-[25%]">Programación</TableHead>
		<TableHead class="w-[25%]">Job</TableHead>
		<TableHead class="w-[100%]">Parte</TableHead>
		<TableHead class="w-[100%]">Tiempo</TableHead>
		<TableHead class="w-[100%]">Due Date</TableHead>
		<TableHead class="w-[100%]">Facturado</TableHead>
		<TableHead class="w-[25%]">Cliente</TableHead>
	</TableHeader>
	<TableBody>
		{#each $orders?.data as row, i}
			<TableRow>
				<TableCell>{row.programation || ''}</TableCell>
				<TableCell>{row.jobpo || ''}</TableCell>
				<TableCell>{row.part || ''}</TableCell>
				<TableCell>{row.time || ''}</TableCell>
				<TableCell>{formatDate(row.due) || ''}</TableCell>
				<TableCell class="px-2 text-center"
					><Checkbox
						onclick={(e) => {
							e.preventDefault();
							show = true;
							selectedRow = row;
						}}
						checked={row.invoiced}
					/></TableCell
				>
				<TableCell>
					<Badge color={$clients?.data?.[row.clientId]?.color}
						>{$clients?.data?.[row.clientId]?.name}
					</Badge>
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp
	bind:show
	deleteFunc={checkMovement}
	text={`Marcar ${selectedRow.jobpo} como ${selectedRow.invoiced ? 'no facturado' : 'facturado'}?`}
	warning={true}
/>
