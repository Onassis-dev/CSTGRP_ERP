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
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { Badge } from '$lib/components/ui/badge';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedArea: any = $state({});

	let areas: any[] = $state([]);

	async function getAreas() {
		const result = await api.get('/areas');
		areas = result.data;
	}

	function editArea(i: number) {
		selectedArea = areas[i];
		show = true;
	}
	function createArea() {
		selectedArea = {};
		show = true;
	}
	function deleteArea(i: number) {
		selectedArea = areas[i];
		show1 = true;
	}

	onMount(() => {
		getAreas();
	});
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createArea}><PlusCircle class="size-3.5" />Añadir area</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead></TableHead>
		<TableHead class="w-full">Nombre</TableHead>
		<TableHead>Captura</TableHead>
		<TableHead>Color</TableHead>
	</TableHeader>
	<TableBody>
		{#each areas as area, i}
			<TableRow>
				<OptionsCell editFunc={() => editArea(i)} deleteFunc={() => deleteArea(i)} />
				<TableCell>{area.name}</TableCell>
				<TableCell>
					{#if area.captured}
						<Check />
					{/if}
				</TableCell>
				<TableCell><Badge color={area.color}>{area.color}</Badge></TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<AreaForms bind:show bind:selectedArea reload={getAreas} />
<DeletePopUp
	bind:show={show1}
	text="Borrar area"
	deleteFunc={async () => {
		await api.delete('areas', { data: { id: parseInt(selectedArea.id || '') } });
		showSuccess('Area eliminada');
		show1 = false;
	}}
/>
