<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import DeliveriesForm from './DeliveriesForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';
	import { getContractors, getOptions } from '$lib/utils/queries';
	import Input from '$lib/components/ui/input/input.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';

	let showForm: boolean = $state(false);
	let selectedMovement: any = $state({});
	let showDelete: boolean = $state(false);

	let filters = $state({
		programation: '',
		jobpo: '',
		contractorId: '',
		approved: 'false'
	});

	const approvedOptions = [
		{ name: 'Aprobado', color: 'green', value: 'true' },
		{ name: 'Pendiente', color: 'yellow', value: 'false' }
	];

	const deliveries = createQuery({
		queryKey: ['contractors-deliveries'],
		queryFn: async () =>
			(
				await api.get('/contractors/deliveries', {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['contractors-deliveries']);
	});

	const contractors = createQuery({
		queryKey: ['contractors'],
		queryFn: getContractors
	});

	const contractorsQuery = $derived(getOptions($contractors.data));
</script>

<MenuBar>
	<div class="flex flex-col gap-1.5 lg:flex-row">
		<Input menu bind:value={filters.programation} placeholder="Programación" class="max-w-32" />
		<Input menu bind:value={filters.jobpo} placeholder="Job" class="max-w-32" />
		<Select
			placeholder="Completado"
			menu
			items={approvedOptions}
			bind:value={filters.approved}
			class="w-40"
		/>
		<Select
			placeholder="Contratista"
			menu
			items={contractorsQuery}
			bind:value={filters.contractorId}
			allowDeselect
			class="min-w-48"
		/>
	</div>
</MenuBar>
<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="">Contratista</TableHead>
		<TableHead class="">Programación</TableHead>
		<TableHead class="">Job/PO</TableHead>
		<TableHead class="min-w-52">Parte</TableHead>
		<TableHead class="">Fecha</TableHead>
		<TableHead class="">Cantidad</TableHead>
		<TableHead class="">Rechazado</TableHead>
		<TableHead class="w-full">Total</TableHead>
	</TableHeader>
	<TableBody>
		{#each $deliveries?.data as delivery}
			<TableRow>
				<OptionsCell
					editFunc={() => {
						selectedMovement = delivery;
						showForm = true;
					}}
				/>
				<TableCell>
					<Badge color="gray">
						{$contractors?.data?.[delivery.contractorId]?.name}
					</Badge>
				</TableCell>
				<TableCell>{delivery.programation}</TableCell>
				<TableCell>{delivery.ref}</TableCell>
				<TableCell>{delivery.description}</TableCell>
				<TableCell>{formatDate(delivery.date)}</TableCell>
				<TableCell>{delivery.amount}</TableCell>
				<TableCell>{delivery.rejected}</TableCell>
				<TableCell>{delivery.accepted}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeliveriesForm bind:show={showForm} bind:selectedMovement />

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar entrega"
	deleteFunc={async () => {
		await api.delete('/contractors/deliveries', { data: { id: selectedMovement.id } });
		showSuccess('Movimiento eliminado');
		refetch(['contractors-deliveries']);
		showDelete = false;
	}}
/>
