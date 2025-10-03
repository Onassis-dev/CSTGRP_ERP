<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { formatDate } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { Pen, Trash } from 'lucide-svelte';

	interface Props {
		show: boolean;
		selectedOrder: any;
		showForm: boolean;
		selectedMovement: any;
		showDelete: boolean;
	}

	let {
		show = $bindable(),
		selectedOrder = $bindable(),
		showForm = $bindable(),
		selectedMovement = $bindable(),
		showDelete = $bindable()
	}: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (await api.get('/prod-history/' + selectedOrder.id)).data;
	}

	$effect(() => {
		if (selectedOrder?.id) fetchData();
	});
	$effect(() => {
		if (!show) selectedOrder = null;
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[90%]">
		<DialogHeader>
			<DialogTitle>
				{selectedOrder?.jobpo}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l">Area</TableHead>
					<TableHead class="border-l">Cantidad</TableHead>
					<TableHead>Fecha</TableHead>
					<TableHead>Capturado</TableHead>
					<TableHead class="w-1"></TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow class="border-l">
							<TableCell
								>{row.corte
									? 'Corte'
									: row.cortesVarios
										? 'Cortes Varios'
										: row.produccion
											? 'Producción'
											: row.calidad
												? 'Calidad'
												: 'Serigrafía'}</TableCell
							>
							<TableCell
								>{row.corte
									? row.corte
									: row.cortesVarios
										? row.cortesVarios
										: row.produccion
											? row.produccion
											: row.calidad
												? row.calidad
												: row.serigrafia}</TableCell
							>
							<TableCell>{formatDate(row.date)}</TableCell>
							<TableCell>{formatDate(row.created_at)}</TableCell>
							<TableCell class="flex w-min items-center gap-1 px-1 ">
								<Button
									size="icon"
									variant="outline"
									onclick={() => {
										selectedMovement = row;
										show = false;
										showForm = true;
									}}
								>
									<Pen class="size-4" />
								</Button>
								<Button
									size="icon"
									variant="outline"
									onclick={() => {
										selectedMovement = row;
										show = false;
										showDelete = true;
									}}
								>
									<Trash class="size-4" />
								</Button>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
