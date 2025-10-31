<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { Pen } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { Button } from '$lib/components/ui/button';
	import ShipToForm from './ShipToForm.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show3 = $state(false);
	let show4 = $state(false);

	let filters = $state({
		name: ''
	});

	let selectedShipTo: any = $state({});

	const shipToQuery = createQuery({
		queryKey: ['ship-to', { ...filters }],
		queryFn: async () => (await api.get('/ie/ship-to', { params: filters })).data
	});

	let shipTo = $derived(
		$shipToQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function editShipTo(i: number) {
		selectedShipTo = shipTo[i];
		show4 = true;
	}
	function deleteShipTo(i: number) {
		selectedShipTo = shipTo[i];
		show3 = true;
	}

	async function handleDelete() {
		await api.delete('/ie/ship-to/' + selectedShipTo.id);
		selectedShipTo = {};
		showSuccess('Ship to eliminado');
		refetch(['ship-to']);
		show3 = false;
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['ship-to']))}
	>
		<Input menu bind:value={filters.name} placeholder="Nombre" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedShipTo = {};
				show4 = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead>Destino</TableHead>
		<TableHead class="w-full">Dirección</TableHead>
	</TableHeader>
	<TableBody>
		{#each shipTo as shipToItem, i}
			<TableRow>
				<OptionsCell
					editFunc={() => editShipTo(i)}
					deleteFunc={() => deleteShipTo(i)}
				/>
				<TableCell>{shipToItem.name}</TableCell>
				<TableCell>{shipToItem.direction}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={show3} text="Eliminar ship to" deleteFunc={handleDelete} />
<ShipToForm bind:show={show4} {selectedShipTo} />

