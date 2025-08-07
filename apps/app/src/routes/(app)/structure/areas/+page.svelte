<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Button } from '$lib/components/ui/button';
	import { TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableBody from '$lib/components/ui/table/table-body.svelte';
	import api from '$lib/utils/server';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import AreaForms from './AreaForms.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import { Check, PlusCircle } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedArea: any = $state({});

	const areas = createQuery({
		queryKey: ['structure-areas'],
		queryFn: async () => (await api.get('/areas')).data
	});

	function editArea(i: number) {
		selectedArea = $areas?.data?.[i];
		show = true;
	}
	function createArea() {
		selectedArea = {};
		show = true;
	}
	function deleteArea(i: number) {
		selectedArea = $areas?.data?.[i];
		show1 = true;
	}

	let types = {
		prod: 'Produccion',
		admin: 'Administracion'
	};
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createArea} size="action"><PlusCircle class="size-3.5" />Añadir area</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-full">Nombre</TableHead>
		<TableHead>Captura</TableHead>
		<TableHead>Activa</TableHead>
		<TableHead>Tipo</TableHead>
		<TableHead>Color</TableHead>
	</TableHeader>
	<TableBody>
		{#each $areas?.data as area, i}
			<TableRow>
				<OptionsCell editFunc={() => editArea(i)} deleteFunc={() => deleteArea(i)} />
				<TableCell>{area.name}</TableCell>
				<TableCell>
					{#if area.captured}
						<Check class="mx-auto size-4" />
					{/if}
				</TableCell>
				<TableCell>
					{#if area.active}
						<Check class="mx-auto size-4" />
					{/if}
				</TableCell>
				<TableCell>
					<Badge color="gray">{types[area.type as keyof typeof types] || ''}</Badge>
				</TableCell>
				<TableCell><Badge color={area.color}>{area.color}</Badge></TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<AreaForms bind:show bind:selectedArea />
<DeletePopUp
	bind:show={show1}
	text="Eliminar area"
	deleteFunc={async () => {
		await api.delete('areas', { data: { id: parseInt(selectedArea.id || '') } });
		showSuccess('Area eliminada');
		refetch(['structure-areas']);
		show1 = false;
	}}
/>
