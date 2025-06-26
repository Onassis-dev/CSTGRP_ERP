<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { Ruler } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import MaterialComparisonCard from './MaterialComparisonCard.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

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

	let filters = $state({
		code: '',
		clientId: ''
	});

	const inventory = createQuery({
		queryKey: ['inventory'],
		queryFn: async () => (await api.get('/clients')).data
	});

	let filteredInventory = $derived(
		$inventory?.data?.filter((material: any) => {
			if (filters.code) return material.code?.toUpperCase()?.includes(filters.code.toUpperCase());
			return true;
		})
	);

	function viewComparison(i: number) {
		selectedMaterial = filteredInventory[i];
		show = true;
	}
</script>

<MenuBar>
	<Input menu bind:value={filters.code} placeholder="Lookup part number" />
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
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
