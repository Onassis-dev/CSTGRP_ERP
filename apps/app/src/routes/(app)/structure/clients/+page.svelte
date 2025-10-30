<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Check, PlusCircle } from 'lucide-svelte';
	import PositionsForm from './ClientsForm.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedPosition: any = $state({});

	const positions = createQuery({
		queryKey: ['structure-clients'],
		queryFn: async () => (await api.get('/clients-list')).data
	});

	function editPosition(i: number) {
		selectedPosition = $positions?.data?.[i];
		show = true;
	}
	function createPosition() {
		selectedPosition = { active: true, name: '', color: '' };
		show = true;
	}
	function deletePosition(i: number) {
		selectedPosition = $positions?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createPosition} size="action"
			><PlusCircle class=" size-3.5" />Añadir cliente</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead>Nombre</TableHead>
		<TableHead class="w-full">Legal</TableHead>
		<TableHead>Color</TableHead>
		<TableHead>$/hora</TableHead>
		<TableHead>Activo</TableHead>
	</TableHeader>
	<TableBody>
		{#each $positions?.data as position, i}
			<TableRow>
				<OptionsCell editFunc={() => editPosition(i)} deleteFunc={() => deletePosition(i)} />
				<TableCell>{position.name}</TableCell>
				<TableCell>{position.legalName}</TableCell>
				<TableCell><Badge color={position.color}>{position.color}</Badge></TableCell>
				<TableCell>{position.hourPrice}</TableCell>
				<TableCell>
					{#if position.active}
						<Check class="mx-auto size-4" />
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<PositionsForm bind:show bind:selectedPosition />
<DeletePopUp
	bind:show={show1}
	text="Eliminar cliente"
	deleteFunc={async () => {
		await api.delete('clients-list', { data: { id: parseInt(selectedPosition.id || '') } });
		showSuccess('Cliente eliminado');
		refetch(['structure-clients']);
		show1 = false;
	}}
/>
