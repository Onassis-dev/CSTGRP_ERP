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
	import DestinationDirectionsForm from './DestinationDirectionsForm.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show3 = $state(false);
	let show4 = $state(false);

	let filters = $state({
		name: ''
	});

	let selectedDestinationDirection: any = $state({});

	const destinationDirectionsQuery = createQuery({
		queryKey: ['destination-directions', { ...filters }],
		queryFn: async () => (await api.get('/ie/destination-directions', { params: filters })).data
	});

	let destinationDirections = $derived(
		$destinationDirectionsQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function editDestinationDirection(i: number) {
		selectedDestinationDirection = destinationDirections[i];
		show4 = true;
	}
	function deleteDestinationDirection(i: number) {
		selectedDestinationDirection = destinationDirections[i];
		show3 = true;
	}

	async function handleDelete() {
		await api.delete('/ie/destination-directions/' + selectedDestinationDirection.id);
		selectedDestinationDirection = {};
		showSuccess('Dirección de destino eliminada');
		refetch(['destination-directions']);
		show3 = false;
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['destination-directions']))}
	>
		<Input menu bind:value={filters.name} placeholder="Nombre" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedDestinationDirection = {};
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
		{#each destinationDirections as destinationDirection, i}
			<TableRow>
				<OptionsCell
					editFunc={() => editDestinationDirection(i)}
					deleteFunc={() => deleteDestinationDirection(i)}
				/>
				<TableCell>{destinationDirection.name}</TableCell>
				<TableCell>{destinationDirection.direction}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={show3} text="Eliminar dirección de destino" deleteFunc={handleDelete} />
<DestinationDirectionsForm bind:show={show4} {selectedDestinationDirection} />
