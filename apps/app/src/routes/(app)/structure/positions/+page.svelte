<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { CheckCircle, PlusCircle } from 'lucide-svelte';
	import PositionsForm from './PositionsForm.svelte';
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
	let selectedPosition: any = $state({
		name: '',
		color: '',
		supervisor: false
	});

	const positions = createQuery({
		queryKey: ['structure-positions'],
		queryFn: async () => (await api.get('/positions')).data
	});

	function editPosition(i: number) {
		selectedPosition = $positions?.data?.[i];
		show = true;
	}
	function createPosition() {
		selectedPosition = {
			name: '',
			color: '',
			supervisor: false
		};
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
			><PlusCircle class=" size-3.5" />Añadir posicion</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-full">Nombre</TableHead>
		<TableHead>Color</TableHead>
		<TableHead>Supervisor</TableHead>
	</TableHeader>
	<TableBody>
		{#each $positions?.data as position, i}
			<TableRow>
				<OptionsCell editFunc={() => editPosition(i)} deleteFunc={() => deletePosition(i)} />
				<TableCell>{position.name}</TableCell>
				<TableCell><Badge color={position.color}>{position.color}</Badge></TableCell>
				<TableCell>
					{#if position.supervisor}
						<CheckCircle class="size-4 text-green-500" />
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<PositionsForm bind:show bind:selectedPosition />
<DeletePopUp
	bind:show={show1}
	text="Eliminar posicion"
	deleteFunc={async () => {
		await api.delete('positions', { data: { id: parseInt(selectedPosition.id || '') } });
		showSuccess('Posicion eliminada');
		refetch(['structure-positions']);
		show1 = false;
	}}
/>
