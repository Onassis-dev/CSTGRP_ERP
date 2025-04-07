<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { formatDate } from '$lib/utils/functions';
	import OrdersForm from './OrdersForm.svelte';
	import { Eye, Pen, Ruler } from 'lucide-svelte';
	import { preventDefault } from 'svelte/legacy';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import OrderHistory from './OrderHistory.svelte';

	let clients: any = $state({});

	let show = $state(false);
	let show2 = $state(false);

	let filters = $state({
		type: 'both',
		code: ''
	});

	let selectedMovement: any = $state({});

	let options = [
		{ value: 'both', name: 'Ambos' },
		{ value: 'imports', name: 'Importaciones' },
		{ value: 'exports', name: 'Exportaciones' }
	];

	let movements: any[] = $state([]);

	async function getOrders() {
		movements = (await api.get(`/orders`, { params: filters })).data;

		const clientList = (await api.get('/inventoryvarious/clients')).data;
		clientList.forEach((client: any) => {
			clients[client.value] = client;
		});
	}

	function openProgress(i: number) {
		selectedMovement = movements[i];
		show = true;
	}

	function openHistory(i: number) {
		selectedMovement = movements[i];
		show2 = true;
	}

	onMount(() => {
		getOrders();
	});
</script>

<MenuBar>
	<form class="flex flex-col gap-2 lg:flex-row" onsubmit={preventDefault(getOrders)} action={''}>
		<Select
			menu
			class="min-w-36"
			items={options}
			bind:value={filters.type}
			onValueChange={getOrders}
		/>
		<Input menu bind:value={filters.code} placeholder="Identificador" />
	</form>
	{#snippet right()}{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="border-r-0"></TableHead>
		<TableHead class="">Parte</TableHead>
		<TableHead class="">Programacion</TableHead>
		<TableHead class="">Job-PO</TableHead>
		<TableHead class="">Fecha de pedido</TableHead>
		<TableHead class="">Cantidad</TableHead>
		<TableHead class="">Cortes</TableHead>
		<TableHead class="">Cortes Varios</TableHead>
		<TableHead class="">Produccion</TableHead>
		<TableHead class="">Serigrafia</TableHead>
		<TableHead class="">Calidad</TableHead>
		<TableHead class="">Cliente</TableHead>
		<TableHead class="w-full"></TableHead>
	</TableHeader>
	<TableBody>
		{#each movements as movement, i}
			<TableRow>
				<OptionsCell
					extraButtons={[
						{
							fn: () => openProgress(i),
							name: 'Anadir',
							icon: Pen
						},
						{
							fn: () => openHistory(i),
							name: 'Historial',
							icon: Eye
						}
					]}
				/>
				<TableCell>{movement.part || ''}</TableCell>
				<TableCell>{movement.programation || ''}</TableCell>
				<TableCell>{movement.jobpo || ''}</TableCell>
				<TableCell>{formatDate(movement.due) || ''}</TableCell>
				<TableCell>{movement.amount || ''}</TableCell>
				<TableCell>{movement.corte || ''}</TableCell>
				<TableCell>{movement.cortesVarios || ''}</TableCell>
				<TableCell>{movement.produccion || ''}</TableCell>
				<TableCell>{movement.serigrafia || ''}</TableCell>
				<TableCell>{movement.calidad || ''}</TableCell>
				<TableCell>
					{#if clients[movement.clientId]}
						<Badge color={clients[movement.clientId].color}
							>{clients[movement.clientId].name}
						</Badge>
					{/if}
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<OrdersForm bind:show bind:selectedJob={selectedMovement} reload={getOrders} />
<OrderHistory bind:show={show2} bind:selectedJob={selectedMovement} />
