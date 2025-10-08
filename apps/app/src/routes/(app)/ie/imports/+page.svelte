<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';
	import { Pen } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { Button } from '$lib/components/ui/button';
	import ImportMovementsForm from './ImportMovementsForm.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show3 = $state(false);
	let show4 = $state(false);

	let filters = $state({
		location: '',
		code: ''
	});

	let selectedMovement: any = $state({});

	let locations = [
		{ value: 'At M&M, In transit', name: 'En transito' },
		{ value: 'At CST, In revision', name: 'En revisión' },
		{ value: 'At CST, Qtys verified', name: 'Listo' }
	];

	const movementsQuery = createQuery({
		queryKey: ['imports', { ...filters }],
		queryFn: async () => (await api.get('/ie/imports', { params: filters })).data
	});

	let movements = $derived(
		$movementsQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function editImport(i: number) {
		selectedMovement = movements[i];
		show4 = true;
	}
	function deleteIE(i: number) {
		selectedMovement = movements[i];
		show3 = true;
	}

	async function handleDelete() {
		await api.delete('/ie/imports/' + selectedMovement.id);
		selectedMovement = {};
		showSuccess('Movimiento eliminado');
		refetch(['imports']);
		show3 = false;
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['imports']))}
	>
		<Select
			menu
			class="min-w-36"
			items={locations}
			allowDeselect
			bind:value={filters.location}
			onValueChange={() => refetch(['imports'])}
		/>
		<Input menu bind:value={filters.code} placeholder="Identificador" />
	</form>
	{#snippet right()}
		<Button
			size="action"
			onclick={() => {
				selectedMovement = {};
				show4 = true;
			}}><Pen class=" size-3.5" />Registrar</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[10%]">Importacion</TableHead>
		<TableHead class="w-[10%]">Ubicacion</TableHead>
		<TableHead class="w-full">Fecha</TableHead>
	</TableHeader>
	<TableBody>
		{#each movements as movement, i}
			<TableRow>
				<OptionsCell editFunc={() => editImport(i)} deleteFunc={() => deleteIE(i)} />
				<TableCell>{movement.import}</TableCell>
				<TableCell>{movement.location}</TableCell>
				<TableCell>{formatDate(movement.due)}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show={show3} text="Eliminar movimiento" deleteFunc={handleDelete} />
<ImportMovementsForm bind:show={show4} {selectedMovement} />
