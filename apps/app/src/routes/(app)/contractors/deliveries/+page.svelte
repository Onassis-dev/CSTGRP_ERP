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
	import { getClients, getOptions } from '$lib/utils/queries';
	import Input from '$lib/components/ui/input/input.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { userData } from '$lib/utils/store';
	import { Button } from '$lib/components/ui/button';
	import ContractorPaymentForm from './ContractorPaymentForm.svelte';

	const canDownloadPayments = ($userData?.permissions.contractors_payments || 0) == 2;

	let showForm: boolean = $state(false);
	let selectedMovement: any = $state({});
	let showDelete: boolean = $state(false);
	let showGeneratePayment: boolean = $state(false);

	let filters = $state({
		programation: '',
		jobpo: '',
		clientId: '',
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
		<Select
			placeholder="Completado"
			menu
			items={approvedOptions}
			bind:value={filters.approved}
			class="w-40"
		/>
	</div>

	{#snippet right()}
		{#if canDownloadPayments}
			<Button size="action" onclick={() => (showGeneratePayment = true)}>Generar pagos</Button>
		{/if}
	{/snippet}
</MenuBar>
<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="">Cliente</TableHead>
		<TableHead class="">Programación</TableHead>
		<TableHead class="">Job/PO</TableHead>
		<TableHead class="min-w-52">Parte</TableHead>
		<TableHead class="">Due date</TableHead>
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
					<Badge color={$clients?.data?.[delivery.clientId]?.color}>
						{$clients?.data?.[delivery.clientId]?.name}
					</Badge>
				</TableCell>
				<TableCell>{delivery.programation}</TableCell>
				<TableCell>{delivery.ref}</TableCell>
				<TableCell>{delivery.clientId === 3 ? delivery.part : delivery.description}</TableCell>
				<TableCell>{formatDate(delivery.due)}</TableCell>
				<TableCell>{delivery.amount}</TableCell>
				<TableCell>{delivery.rejected}</TableCell>
				<TableCell>{delivery.accepted}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeliveriesForm bind:show={showForm} bind:selectedMovement />

<ContractorPaymentForm bind:show={showGeneratePayment} />

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
