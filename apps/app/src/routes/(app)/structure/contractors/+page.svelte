<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Check, PlusCircle } from 'lucide-svelte';
	import PositionsForm from './ContractorForm.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedPosition: any = $state({});

	const contractors = createQuery({
		queryKey: ['structure-contractors'],
		queryFn: async () => (await api.get('/contractors-list')).data
	});

	function editPosition(i: number) {
		selectedPosition = $contractors?.data?.[i];
		show = true;
	}
	function createPosition() {
		selectedPosition = { active: true, name: '' };
		show = true;
	}
	function deletePosition(i: number) {
		selectedPosition = $contractors?.data?.[i];
		show1 = true;
	}
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createPosition} size="action"
			><PlusCircle class=" size-3.5" />Añadir contratista</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-full">Nombre</TableHead>
		<TableHead>Activo</TableHead>
	</TableHeader>
	<TableBody>
		{#each $contractors?.data as contractor, i}
			<TableRow>
				<OptionsCell editFunc={() => editPosition(i)} deleteFunc={() => deletePosition(i)} />
				<TableCell>{contractor.name}</TableCell>
				<TableCell>
					{#if contractor.active}
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
	text="Eliminar contratista"
	deleteFunc={async () => {
		await api.delete('contractors-list', { data: { id: parseInt(selectedPosition.id || '') } });
		showSuccess('contratista eliminado');
		refetch(['structure-contractors']);
		show1 = false;
	}}
/>
