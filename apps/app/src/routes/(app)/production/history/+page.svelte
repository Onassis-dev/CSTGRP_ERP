<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import EmailsForm from './historyForm.svelte';
	import PwCell from '$lib/components/ui/table/pw-cell.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedEmail: any = $state({});

	const emails = createQuery({
		queryKey: ['emails'],
		queryFn: async () => (await api.get('/emails')).data
	});

	function editEmail(i: number) {
		selectedEmail = $emails?.data?.[i];
		show = true;
	}
	function createEmail() {
		selectedEmail = {};
		show = true;
	}
	function deleteEmail(i: number) {
		selectedEmail = $emails?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createEmail} size="action"
			><PlusCircle class=" size-3.5" />Añadir correo</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[80%]">Correo</TableHead>
		<TableHead class="w-[30%]">Contraseña</TableHead>
	</TableHeader>
	<TableBody>
		{#each $emails?.data as email, i}
			<TableRow>
				<OptionsCell editFunc={() => editEmail(i)} deleteFunc={() => deleteEmail(i)} />
				<TableCell class="w-full">{email.email || ''}</TableCell>
				<PwCell password={email.password || ''}></PwCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<EmailsForm bind:show bind:selectedEmail />
<DeletePopUp
	bind:show={show1}
	text="Eliminar correo"
	deleteFunc={async () => {
		await api.delete('/emails', { data: { id: parseInt(selectedEmail.id || '') } });
		showSuccess('Correo eliminada');
		refetch(['emails']);
		show1 = false;
	}}
/>
