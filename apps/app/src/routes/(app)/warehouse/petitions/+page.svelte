<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { FileDown, Search } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let filters = $state({
		folio: ''
	});

	let show = $state(false);
	let selectedMovement: any = $state();

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

	async function download(i: number) {
		const response = await api.get('/petitions/download/' + $petitionsQuery?.data[i]?.id, {
			responseType: 'arraybuffer'
		});

		const blob = new Blob([response.data], {
			type: 'application/pdf'
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.target = '_blank';

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-1 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['petitions']))}
	>
		<Input menu bind:value={filters.folio} placeholder="Folio" />
		<Button type="submit" variant="outline" size="icon"><Search class="size-3.5" /></Button>
	</form>
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-3 z-30 bg-inherit p-1"></TableHead>
		<TableHead>Folio</TableHead>
		<TableHead>Codigo</TableHead>
		<TableHead>Descripción</TableHead>
		<TableHead>Pedido</TableHead>
		<TableHead>Necesario</TableHead>
	</TableHeader>
	<TableBody>
		{#each $petitionsQuery?.data as movement, i}
			<TableRow>
				<OptionsCell
					deleteFunc={() => {
						selectedMovement = movement;
						show = true;
					}}
					extraButtons={[
						{
							fn: () => {
								download(i);
							},
							name: 'Descargar',
							icon: FileDown
						}
					]}
				/>
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

<DeletePopUp
	bind:show
	text="¿Estás seguro de que quieres eliminar esta requisicion?"
	deleteFunc={handleDelete}
/>
