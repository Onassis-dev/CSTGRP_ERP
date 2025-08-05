<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import EmailsForm from './historyForm.svelte';
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
	import OrderCard from './OrderCard.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';

	let showCard: boolean = $state(false);
	let showForm: boolean = $state(false);
	let selectedOrder: any = $state({});
	let selectedMovement: any = $state({});
	let showDelete: boolean = $state(false);

	let filters = $state({
		programation: '',
		jobpo: '',
		clientId: '',
		completed: 'false'
	});

	const completedOptions = [
		{ name: 'Completado', color: 'green', value: 'true' },
		{ name: 'Pendiente', color: 'yellow', value: 'false' }
	];

	const prodHistory = createQuery({
		queryKey: ['prod-history'],
		queryFn: async () =>
			(
				await api.get('/prod-history', {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['prod-history']);
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
			items={completedOptions}
			bind:value={filters.completed}
			class="w-40"
		/>
	</div>
</MenuBar>
<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="">Cliente</TableHead>
		<TableHead class="">Programación</TableHead>
		<TableHead class="">Job/PO</TableHead>
		<TableHead class="">Parte</TableHead>
		<TableHead class="w-full">Due date</TableHead>
		<TableHead class="">Cantidad</TableHead>
		<TableHead class="">Corte</TableHead>
		<TableHead class="">Cortes Varios</TableHead>
		<TableHead class="">Serigrafía</TableHead>
		<TableHead class="">Producción</TableHead>
		<TableHead class="">Calidad</TableHead>
	</TableHeader>
	<TableBody>
		{#each $prodHistory?.data as email, i}
			<TableRow>
				<OptionsCell
					viewFunc={() => {
						selectedOrder = email;
						showCard = true;
					}}
				/>
				<TableCell>
					<Badge color={$clients?.data?.[email.clientId]?.color}>
						{$clients?.data?.[email.clientId]?.name}
					</Badge>
				</TableCell>
				<TableCell>{email.programation}</TableCell>
				<TableCell>{email.jobpo}</TableCell>
				<TableCell>{email.part}</TableCell>
				<TableCell>{formatDate(email.due)}</TableCell>
				<TableCell>{email.amount}</TableCell>
				<TableCell
					><Badge color={email.corte === email.amount ? 'green' : 'outline'}
						>{email.corte === null ? '' : email.corte}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={email.cortesVarios === email.amount ? 'green' : 'outline'}
						>{email.cortesVarios === null ? '' : email.cortesVarios}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={email.serigrafia === email.amount ? 'green' : 'outline'}
						>{email.serigrafia === null ? '' : email.serigrafia}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={email.produccion === email.amount ? 'green' : 'outline'}
						>{email.produccion === null ? '' : email.produccion}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={email.calidad === email.amount ? 'green' : 'outline'}
						>{email.calidad === null ? '' : email.calidad}</Badge
					></TableCell
				>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<EmailsForm bind:show={showForm} bind:selectedMovement />
<OrderCard
	bind:show={showCard}
	bind:showForm
	bind:selectedOrder
	bind:selectedMovement
	bind:showDelete
/>

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar movimiento"
	deleteFunc={async () => {
		await api.delete('/prod-history', { data: { id: selectedMovement.id } });
		showSuccess('Movimiento eliminado');
		refetch(['prod-history']);
		showDelete = false;
	}}
/>
