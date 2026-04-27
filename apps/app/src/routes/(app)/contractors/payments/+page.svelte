<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';
	import Input from '$lib/components/ui/input/input.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import PaymentsForm from './PaymentsForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { FileDown } from 'lucide-svelte';

	let showForm: boolean = $state(false);
	let selectedMovement: any = $state({});
	let showDelete: boolean = $state(false);

	let filters = $state({
		folio: '',
		date: ''
	});

	const payments = createQuery({
		queryKey: ['contractors-payments'],
		queryFn: async () =>
			(
				await api.get('/contractors/payments', {
					params: filters
				})
			).data
	});

	$effect(() => {
		({ ...filters });
		refetch(['contractors-payments']);
	});
</script>

<MenuBar>
	<div class="flex flex-col gap-1.5 lg:flex-row">
		<Input
			menu
			bind:value={filters.folio}
			placeholder="Folio"
			class="max-w-32"
			oninput={() => refetch(['contractors-payments'])}
		/>
		<Input
			menu
			bind:value={filters.date}
			placeholder="Fecha"
			class="max-w-40"
			type="date"
			oninput={() => refetch(['contractors-payments'])}
		/>
	</div>

	{#snippet right()}
		<Button size="action" onclick={() => (showForm = true)}>Generar pagos</Button>
	{/snippet}
</MenuBar>
<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="">Folio</TableHead>
		<TableHead class="">Inicio del periodo</TableHead>
		<TableHead class="w-full">Fin del periodo</TableHead>
	</TableHeader>
	<TableBody>
		{#each $payments?.data as payment}
			<TableRow>
				<OptionsCell
					extraButtons={[
						{
							fn: () => {
								window.open(
									import.meta.env.VITE_BASEURL + '/contractors/payments/download?id=' + payment.id,
									'_blank'
								);
							},
							name: 'Descargar',
							icon: FileDown
						}
					]}
					deleteFunc={() => {
						selectedMovement = payment;
						showDelete = true;
					}}
				/>

				<TableCell>{payment.folio}</TableCell>
				<TableCell>{formatDate(payment.startDate)}</TableCell>
				<TableCell>{formatDate(payment.endDate)}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<PaymentsForm bind:show={showForm} />

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar pago"
	deleteFunc={async () => {
		await api.delete('/contractors/payments', { data: { id: selectedMovement.id } });
		showSuccess('Pago eliminado');
		refetch(['contractors-payments']);
		showDelete = false;
	}}
/>
