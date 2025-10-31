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
	import ShippersForm from './ShippersForm.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show3 = $state(false);
	let show4 = $state(false);

	let filters = $state({
		name: ''
	});

	let selectedShipper: any = $state({});

	const shippersQuery = createQuery({
		queryKey: ['shippers', { ...filters }],
		queryFn: async () => (await api.get('/ie/shippers', { params: filters })).data
	});

	let shippers = $derived(
		$shippersQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function editShipper(i: number) {
		selectedShipper = shippers[i];
		show4 = true;
	}
	function deleteShipper(i: number) {
		selectedShipper = shippers[i];
		show3 = true;
	}

	async function handleDelete() {
		await api.delete('/ie/shippers/' + selectedShipper.id);
		selectedShipper = {};
		showSuccess('Transporte eliminado');
		refetch(['shippers']);
		show3 = false;
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['shippers']))}
	>
		<Input menu bind:value={filters.name} placeholder="Nombre" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedShipper = {};
				show4 = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-full">Transporte</TableHead>
	</TableHeader>
	<TableBody>
		{#each shippers as shipper, i}
			<TableRow>
				<OptionsCell editFunc={() => editShipper(i)} deleteFunc={() => deleteShipper(i)} />
				<TableCell>{shipper.name}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={show3} text="Eliminar Transporte" deleteFunc={handleDelete} />
<ShippersForm bind:show={show4} {selectedShipper} />
