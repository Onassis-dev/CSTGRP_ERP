<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import EmailsForm from './historyForm.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedEmail: any = $state({});

	const prodHistory = createQuery({
		queryKey: ['prod-history'],
		queryFn: async () => (await api.get('/prod-history')).data
	});

	function editEmail(i: number) {
		selectedEmail = $prodHistory?.data?.[i];
		show = true;
	}
	function createEmail() {
		selectedEmail = {};
		show = true;
	}
	function deleteEmail(i: number) {
		selectedEmail = $prodHistory?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar />

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-1/6">Orden</TableHead>
		<TableHead class="w-1/6">Corte</TableHead>
		<TableHead class="w-1/6">Cortes Varios</TableHead>
		<TableHead class="w-1/6">Producción</TableHead>
		<TableHead class="w-1/6">Calidad</TableHead>
		<TableHead class="w-1/6">Serigrafía</TableHead>
		<TableHead class="w-1/6">Fecha</TableHead>
	</TableHeader>
	<TableBody>
		{#each $prodHistory?.data as email, i}
			<TableRow>
				<OptionsCell editFunc={() => editEmail(i)} deleteFunc={() => deleteEmail(i)} />
				<TableCell>{email.jobpo}</TableCell>
				<TableCell>{email.corte || ''}</TableCell>
				<TableCell>{email.cortesVarios || ''}</TableCell>
				<TableCell>{email.produccion || ''}</TableCell>
				<TableCell>{email.calidad || ''}</TableCell>
				<TableCell>{email.serigrafia || ''}</TableCell>
				<TableCell>{formatDate(email.created_at)}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<EmailsForm bind:show bind:selectedEmail />
<DeletePopUp
	bind:show={show1}
	text="Eliminar movimiento"
	deleteFunc={async () => {
		await api.delete('/prod-history', { data: { id: parseInt(selectedEmail.id || '') } });
		showSuccess('Movimiento eliminado');
		refetch(['prod-history']);
		show1 = false;
	}}
/>
