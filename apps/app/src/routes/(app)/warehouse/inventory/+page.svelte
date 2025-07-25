<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { FileDown, PlusCircle, Ruler } from 'lucide-svelte';
	import MaterialCard from './MaterialCard.svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import MaterialsForm from './MaterialsForm.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import MaterialComparisonCard from './MaterialComparisonCard.svelte';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { createQuery } from '@tanstack/svelte-query';
	import { getClients } from '$lib/utils/queries';
	import { downloadFile } from '$lib/utils/files';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import Select from '$lib/components/basic/Select.svelte';

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

	let filters = $state({
		code: '',
		clientId: ''
	});

	const inventoryQuery = createQuery({
		queryKey: ['inventory', filters],
		queryFn: async () => (await api.get('/inventory')).data
	});

	let filteredInventory = $derived(
		$inventoryQuery?.data?.filter((material: any) => {
			if (filters.code) {
				if (!material.code?.toUpperCase()?.includes(filters.code.toUpperCase())) return false;
			}
			if (filters.clientId) {
				if (parseInt(material.clientId) !== parseInt(filters.clientId)) return false;
			}
			return true;
		})
	);

	const clients = createQuery({
		queryKey: ['clients'],
		queryFn: getClients
	});

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
		show2 = false;
	}

	const clientsQuery = createQuery({
		queryKey: ['inventory-clients'],
		queryFn: async () => (await api.get('/inventoryvarious/clients')).data
	});
</script>

<MenuBar>
	{#snippet left()}
		<Input menu bind:value={filters.code} placeholder="Codigo" class="w-52" />
		<Select
			placeholder="Cliente"
			menu
			items={$clientsQuery?.data}
			bind:value={filters.clientId}
			allowDeselect
			class="w-40"
		/>
	{/snippet}
	{#snippet right()}
		<Button
			onclick={() =>
				downloadFile({
					url: '/inventory/export',
					name: `Inventario ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}.xlsx`
				})}
			variant="outline"
			size="icon"><FileDown class="size-3.5" /></Button
		>
		<Button onclick={createMaterial} size="action"
			><PlusCircle class=" size-3.5" />Añadir Material</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
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
		{#each filteredInventory || [] as material, i}
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
				<TableCell
					class="w-full min-w-24 max-w-1 overflow-hidden text-ellipsis"
					title={material.description}>{material.description}</TableCell
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
					{#if $clients?.data?.[material.clientId]}
						<Badge color={$clients?.data?.[material.clientId]?.color}
							>{$clients?.data?.[material.clientId]?.name}
						</Badge>
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<MaterialCard bind:show bind:selectedMaterial />
<MaterialComparisonCard bind:show={show3} bind:selectedMaterial />
<MaterialsForm bind:show={show1} bind:selectedMaterial />
<DeletePopUp bind:show={show2} text="Eliminar material" deleteFunc={handleDelete} />
