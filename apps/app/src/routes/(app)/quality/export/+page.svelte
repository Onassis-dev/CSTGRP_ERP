<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { formatDate } from '$lib/utils/functions';
	import { Pen } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OrderDestinations from './OrderDestinations.svelte';

	let selectedRow: any = $state({});
	let show: boolean = $state(false);

	let filters = $state({
		jobpo: '',
		programation: '',
		part: ''
	});

	const ordersQuery = createQuery({
		queryKey: ['quality-orders', { ...filters }],
		queryFn: async () => (await api.get('/quality/orders', { params: filters })).data
	});
	let orders = $derived($ordersQuery?.data || []);
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['quality-orders']))}
	>
		<Input
			menu
			bind:value={filters.jobpo}
			placeholder="Job PO"
			onkeydown={(e) => (e.key === 'Enter' ? refetch(['quality-orders']) : null)}
		/>
		<Input
			menu
			bind:value={filters.programation}
			placeholder="Programación"
			onkeydown={(e) => (e.key === 'Enter' ? refetch(['quality-orders']) : null)}
		/>
		<Input
			menu
			bind:value={filters.part}
			placeholder="Parte"
			onkeydown={(e) => (e.key === 'Enter' ? refetch(['quality-orders']) : null)}
		/>
	</form>
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[20%]">Job PO</TableHead>
		<TableHead class="w-[20%]">Programación</TableHead>
		<TableHead class="w-[20%]">Parte</TableHead>
		<TableHead class="w-[20%]">Cantidad</TableHead>
		<TableHead class="w-[20%]">Due Date</TableHead>
	</TableHeader>
	<TableBody>
		{#each orders as order, i}
			<TableRow>
				<OptionsCell
					editFunc={() => {
						selectedRow = order;
						show = true;
					}}
				/>
				<TableCell>{order.ref}</TableCell>
				<TableCell>{order.programation}</TableCell>
				<TableCell>{order.part}</TableCell>
				<TableCell>{order.amount}</TableCell>
				<TableCell>{formatDate(order.due)}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<OrderDestinations bind:show bind:selectedRow />
