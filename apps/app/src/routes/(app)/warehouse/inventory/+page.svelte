<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { FileDown, PlusCircle, Ruler } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import MaterialCard from './MaterialCard.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import MaterialsForm from './MaterialsForm.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import MaterialComparisonCard from './MaterialComparisonCard.svelte';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';

	let show = $state(false);
	let show1 = $state(false);
	let show2 = $state(false);
	let show3 = $state(false);

	let selectedMaterial: any = $state({
		code: '',
		measurement: '',
		description: '',
		minAmount: '',
		clientId: '',
		id: '',
		leftoverAmount: ''
	});
	let inventory: any[] = $state([]);
	let clients: any = $state({});

	let filters = $state({
		code: '',
		clients: ['']
	});

	let filteredInventory = $derived(
		inventory.filter((material) => {
			if (filters.code) {
				if (filters.code) return material.code?.toUpperCase()?.includes(filters.code.toUpperCase());
			}
			return true;
		})
	);

	async function getInventory() {
		const result = await api.get('/inventory');
		inventory = result.data;
		const clientList = (await api.get('/inventoryvarious/clients')).data;
		clientList.forEach((client: any) => {
			clients[client.value] = client;
		});
	}

	async function exportInventory() {
		const response = await api.get('/inventory/export', {
			responseType: 'arraybuffer'
		});

		const blob = new Blob([response.data], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Inventario ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}.xlsx`;

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);
	}

	function viewMaterial(i: number) {
		selectedMaterial = filteredInventory[i];
		show = true;
	}

	function viewComparison(i: number) {
		selectedMaterial = filteredInventory[i];
		show3 = true;
	}

	function editMaterial(i: number) {
		selectedMaterial = filteredInventory[i];
		show1 = true;
	}
	function createMaterial() {
		selectedMaterial = {
			code: '',
			measurement: '',
			description: '',
			minAmount: '',
			clientId: '',
			id: ''
		};
		show1 = true;
	}

	function deleteMaterial(i: number) {
		selectedMaterial = filteredInventory[i];
		show2 = true;
	}

	async function handleDelete() {
		await api.delete('/materials', { data: { id: parseInt(selectedMaterial.id) } });
		selectedMaterial = {
			code: '',
			measurement: '',
			description: '',
			minAmount: '',
			clientId: '',
			id: ''
		};
		showSuccess('Material eliminado');
		await getInventory();
		show2 = false;
	}

	onMount(() => {
		getInventory();
	});
</script>

<MenuBar>
	{#snippet left()}
		<Input menu bind:value={filters.code} placeholder="Codigo" />
	{/snippet}
	{#snippet right()}
		<Button onclick={exportInventory} variant="outline" size="icon"
			><FileDown class="size-3.5" /></Button
		>
		<Button onclick={createMaterial}><PlusCircle class=" size-3.5" />Añadir Material</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-3 z-30 bg-inherit p-1"></TableHead>
		<TableHead>Codigo</TableHead>
		<TableHead>Descripcion</TableHead>
		<TableHead>Ubicacion</TableHead>
		<TableHead>Sobrante</TableHead>
		<TableHead>Cantidad</TableHead>
		<TableHead>Minimo</TableHead>
		<TableHead>Medida</TableHead>
		<TableHead>Cliente</TableHead>
	</TableHeader>
	<TableBody>
		{#each filteredInventory as material, i}
			<TableRow>
				<OptionsCell
					viewFunc={() => viewMaterial(i)}
					editFunc={() => editMaterial(i)}
					deleteFunc={() => deleteMaterial(i)}
					extraButtons={[
						{
							fn: () => viewComparison(i),
							name: 'Comparar',
							icon: Ruler
						}
					]}
				/>

				<TableCell>{material.code}</TableCell>
				<TableCell class="w-full min-w-24 max-w-1 overflow-hidden text-ellipsis"
					>{material.description}</TableCell
				>
				<TableCell>{material.location || ''}</TableCell>
				<TableCell><Badge color="gray">{material.leftoverAmount}</Badge></TableCell>
				<TableCell
					><Badge color={material.amount < material.minAmount ? 'yellow' : 'green'}
						>{material.amount}</Badge
					></TableCell
				>
				<TableCell><Badge color="gray">{material.minAmount}</Badge></TableCell>
				<TableCell>{material.measurement}</TableCell>
				<TableCell>
					{#if clients[material.clientId]}
						<Badge color={clients[material.clientId].color}
							>{clients[material.clientId].name}
						</Badge>
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<MaterialCard bind:show bind:selectedMaterial />
<MaterialComparisonCard bind:show={show3} bind:selectedMaterial />
<MaterialsForm bind:show={show1} bind:selectedMaterial reload={getInventory} />
<DeletePopUp bind:show={show2} text="Eliminar material" deleteFunc={handleDelete} />
