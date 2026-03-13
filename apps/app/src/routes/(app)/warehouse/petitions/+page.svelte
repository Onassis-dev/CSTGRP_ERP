<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { FileDown, Search, RotateCcw } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	let filters = $state({
		folio: '',
		code: ''
	});

	let show = $state(false);
	let selectedMovement: any = $state();
	let petitionsSelected: any[] = $state([]);

	const petitionsQuery = createQuery({
		queryKey: ['petitions', { ...filters }],
		queryFn: async () => (await api.get(`/petitions`, { params: filters })).data
	});

	async function handleDelete() {
		await api.delete('/petitions/' + selectedMovement.id);
		selectedMovement = {};
		showSuccess('Requisicion eliminada');
		refetch(['petitions']);
		show = false;
	}
</script>

<MenuBar>
	<form
		class="flex w-full flex-col gap-1 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['petitions']))}
	>
		<Input menu bind:value={filters.folio} placeholder="Folio" />
		<Input menu bind:value={filters.code} placeholder="Codigo" />
		<Button type="submit" variant="outline" size="icon"><Search class="size-3.5" /></Button>
	</form>

	{#snippet right()}
		<Button
			class="ml-auto"
			onclick={() => {
				window.open(
					import.meta.env.VITE_BASEURL +
						'/petitions/download-multiple?list=' +
						petitionsSelected.join(','),
					'_blank'
				);
			}}
			disabled={petitionsSelected.length === 0}
			size="action"><FileDown class="size-3.5" />{petitionsSelected.length} reqs</Button
		>
		<Button
			onclick={() => {
				petitionsSelected = [];
			}}
			disabled={petitionsSelected.length === 0}
			variant="outline"
			size="icon"><RotateCcw class="size-3.5" /></Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<OptionsHead />
		<TableHead>Folio</TableHead>
		<TableHead>Codigo</TableHead>
		<TableHead>Descripción</TableHead>
		<TableHead>Pedido</TableHead>
		<TableHead>Necesario</TableHead>
	</TableHeader>
	<TableBody>
		{#each $petitionsQuery?.data as movement}
			<TableRow>
				<OptionsCell
					deleteFunc={() => {
						selectedMovement = movement;
						show = true;
					}}
					extraButtons={[
						{
							fn: () =>
								window.open(
									import.meta.env.VITE_BASEURL + '/petitions/download/' + movement.id,
									'_blank'
								),
							name: 'Descargar',
							icon: FileDown
						}
					]}
				/>
				<TableCell>
					<Checkbox
						checked={petitionsSelected.includes(movement.id)}
						onclick={(e) => {
							e.preventDefault();
							if (petitionsSelected.includes(movement.id)) {
								petitionsSelected = petitionsSelected.filter((v) => v !== movement.id);
							} else {
								petitionsSelected.push(movement.id);
							}
						}}
					/>
				</TableCell>
				<TableCell>{movement.folio || ''}</TableCell>
				<TableCell>{movement.code}</TableCell>
				<TableCell class="w-full min-w-24 max-w-1 overflow-hidden text-ellipsis"
					>{movement.description}</TableCell
				>
				<TableCell><Badge color="gray">{movement.requested}</Badge></TableCell>
				<TableCell><Badge color="gray">{movement.necesary}</Badge></TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp bind:show text="Eliminar requisicion" deleteFunc={handleDelete} />
