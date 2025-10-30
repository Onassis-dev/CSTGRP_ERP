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
	import CarriersForm from './CarriersForm.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show3 = $state(false);
	let show4 = $state(false);

	let filters = $state({
		name: ''
	});

	let selectedCarrier: any = $state({});

	const carriersQuery = createQuery({
		queryKey: ['carriers', { ...filters }],
		queryFn: async () => (await api.get('/ie/carriers', { params: filters })).data
	});

	let carriers = $derived(
		$carriersQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function editCarrier(i: number) {
		selectedCarrier = carriers[i];
		show4 = true;
	}
	function deleteCarrier(i: number) {
		selectedCarrier = carriers[i];
		show3 = true;
	}

	async function handleDelete() {
		await api.delete('/ie/carriers/' + selectedCarrier.id);
		selectedCarrier = {};
		showSuccess('Transportista eliminado');
		refetch(['carriers']);
		show3 = false;
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['carriers']))}
	>
		<Input menu bind:value={filters.name} placeholder="Nombre" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedCarrier = {};
				show4 = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-full">Transportista</TableHead>
	</TableHeader>
	<TableBody>
		{#each carriers as carrier, i}
			<TableRow>
				<OptionsCell editFunc={() => editCarrier(i)} deleteFunc={() => deleteCarrier(i)} />
				<TableCell>{carrier.name}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={show3} text="Eliminar transportista" deleteFunc={handleDelete} />
<CarriersForm bind:show={show4} {selectedCarrier} />
