<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { Ruler } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import MaterialComparisonCard from './MaterialComparisonCard.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { hasAccess } from '$lib/utils/functions';

	let show = $state(false);

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
	let clients: any = {};
	let clientList: any[] = $state([]);

	let filters = $state({
		code: '',
		clientId: ''
	});

	let filteredInventory = $derived(
		inventory.filter((material) => {
			if (filters.code) return material.code?.toUpperCase()?.includes(filters.code.toUpperCase());
			return true;
		})
	);

	async function getInventory() {
		clientList = (await api.get('/clients/clients')).data;

		clientList.forEach((client: any) => {
			clients[client.value] = client;
		});

		const result = await api.get('/clients', { params: { clientId: filters.clientId } });
		inventory = result.data;
	}

	function viewComparison(i: number) {
		selectedMaterial = filteredInventory[i];
		show = true;
	}

	onMount(() => {
		getInventory();
	});
</script>

<MenuBar>
	<Input menu bind:value={filters.code} placeholder="Lookup part number" />
	{#if hasAccess('inventory')}
		<Select items={clientList} bind:value={filters.clientId} menu onSelectedChange={getInventory} />
	{/if}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="fixed left-3 z-30 bg-inherit p-1"></TableHead>
		<TableHead>PART NUMBER</TableHead>
		<TableHead>DESCRIPTION</TableHead>
		<TableHead>LOCATION</TableHead>
		<TableHead>INVENTORY</TableHead>
		<TableHead>UOM</TableHead>
	</TableHeader>
	<TableBody>
		{#each filteredInventory as material, i}
			<TableRow>
				<OptionsCell
					extraButtons={[
						{
							fn: () => viewComparison(i),
							name: 'DETAILS',
							icon: Ruler
						}
					]}
				/>

				<TableCell>{material.code}</TableCell>
				<TableCell class="w-full min-w-24 max-w-1 overflow-hidden text-ellipsis"
					>{material.description}</TableCell
				>
				<TableCell class="w-full overflow-hidden">{material.location || ''}</TableCell>
				<TableCell
					><Badge color={material.amount < 0 ? 'red' : 'green'}>{material.amount}</Badge></TableCell
				>
				<TableCell>{material.measurement}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<MaterialComparisonCard bind:show bind:selectedMaterial bind:selectedClient={filters.clientId} />
