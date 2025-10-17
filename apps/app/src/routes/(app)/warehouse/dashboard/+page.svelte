<script lang="ts">
	import api from '$lib/utils/server';
	import { getDayNumber } from '$lib/utils/functions';
	import { Input } from '$lib/components/ui/input';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import DashboardBody from '$lib/components/basic/DashboardBody.svelte';
	import { createQuery } from '@tanstack/svelte-query';

	let selectedDate = $state(new Date().toISOString().split('T')[0]);

	let textDate = $derived(
		['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'][getDayNumber(selectedDate)] +
			' ' +
			selectedDate.split('-')[2] +
			' de ' +
			[
				'Enero',
				'Febrero',
				'Marzo',
				'Abril',
				'Mayo',
				'Junio',
				'Julio',
				'Agosto',
				'Septiembre',
				'Octubre',
				'Noviembre',
				'Diciembre'
			][parseInt(selectedDate.split('-')[1]) - 1]
	);

	const stockWarningsQuery = createQuery({
		queryKey: ['stockwarnings'],
		queryFn: async () => (await api.get('/inventorystats/stockwarnings')).data
	});

	const outOfStockQuery = createQuery({
		queryKey: ['outofstock'],
		queryFn: async () => (await api.get('/inventorystats/outofstock')).data
	});
</script>

<MenuBar>
	{#snippet left()}
		<Input menu class="w-fit" type="date" bind:value={selectedDate}></Input>
	{/snippet}
	{#snippet right()}
		<Input menu class="w-fit font-semibold" value={textDate}></Input>
	{/snippet}
</MenuBar>

<DashboardBody title="Almacen" class="flex flex-col place-items-stretch gap-8">
	<Card class="flex max-h-[85lvh] w-full max-w-full flex-col overflow-hidden">
		<CardHeader>
			<CardTitle>Material faltante para completar ordenes</CardTitle>
		</CardHeader>
		<CardContent class="overflow-y-auto px-0 pb-0 " card>
			<Table class="w-full">
				<TableHeader class="sticky top-0 border-t">
					<TableHead>Codigo</TableHead>
					<TableHead>Descripcion</TableHead>
					<TableHead class="w-min">Job</TableHead>
					<TableHead>Requerido</TableHead>
					<TableHead>Inventario</TableHead>
					<TableHead>Sobrante</TableHead>
					<TableHead>Faltante</TableHead>
					<TableHead class="border-r-0">Medida</TableHead>
				</TableHeader>
				<TableBody>
					{#each $outOfStockQuery?.data as row}
						<TableRow>
							<TableCell>{row.code || ''}</TableCell>
							<TableCell class="whitespace-hidden max-w-64 overflow-hidden text-ellipsis"
								>{row.description || ''}</TableCell
							>
							<TableCell class="w-full whitespace-normal">{row.jobpo || ''}</TableCell>
							<TableCell><Badge color="gray">{row.required || ''}</Badge></TableCell>
							<TableCell><Badge color="gray">{row.amount || ''}</Badge></TableCell>
							<TableCell><Badge color="gray">{row.leftoverAmount || ''}</Badge></TableCell>
							<TableCell><Badge color="red">{row.missing || ''}</Badge></TableCell>
							<TableCell class="!border-b-0 border-r-0">{row.measurement || ''}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</CardContent>
	</Card>
	<Card class="flex max-h-[85lvh] w-full max-w-full flex-col overflow-hidden">
		<CardHeader>
			<CardTitle>En minimos</CardTitle>
		</CardHeader>
		<CardContent class="overflow-auto px-0 pb-0" card>
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead>Codigo</TableHead>
					<TableHead>Cantidad</TableHead>
					<TableHead>Minimo</TableHead>
					<TableHead>Medida</TableHead>
				</TableHeader>
				<TableBody>
					{#each $stockWarningsQuery?.data as row}
						<TableRow>
							<TableCell class="border-l">{row.code}</TableCell>
							<TableCell
								><Badge color={row.amount <= 0 ? 'red' : 'yellow'}>{row.amount || ''}</Badge
								></TableCell
							>
							<TableCell>{row.minAmount || ''}</TableCell>
							<TableCell>{row.measurement || ''}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</CardContent>
	</Card>
</DashboardBody>
