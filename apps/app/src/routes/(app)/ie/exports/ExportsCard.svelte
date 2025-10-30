<script lang="ts">
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
	import api from '$lib/utils/server';
	import { formatDate } from '$lib/utils/functions';
	import Button from '$lib/components/ui/button/button.svelte';

	interface Props {
		show: boolean;
		selectedRow: any;
		showForm: boolean;
	}

	let { show = $bindable(), selectedRow = $bindable(), showForm = $bindable() }: Props = $props();

	let data: any[] = $state([]);

	async function fetchData() {
		data = (await api.get('/ie/exports/' + selectedRow.id)).data;
	}

	$effect(() => {
		if (selectedRow.id) fetchData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[50%] sm:max-w-4xl">
		<DialogHeader>
			<DialogTitle>
				{selectedRow?.so}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l">Job</TableHead>
					<TableHead class="border-l">Parte</TableHead>
					<TableHead class="border-l">Cantidad</TableHead>
					<TableHead class="border-l">Pallets</TableHead>
					<TableHead class="border-l">Fecha</TableHead>
				</TableHeader>
				<TableBody>
					{#each data as row}
						<TableRow>
							<TableCell class="border-l">{row.jobpo}</TableCell>
							<TableCell class="border-l">{row.part}</TableCell>
							<TableCell class="border-l">{row.amount}</TableCell>
							<TableCell class="border-l">{row.pallets}</TableCell>
							<TableCell class="border-l">{formatDate(row.date)}</TableCell>
						</TableRow>
					{/each}
					{#if data.length === 0}
						<TableRow>
							<TableCell class="text-muted-foreground border-l text-center" colspan={100}
								>No hay ordenes</TableCell
							>
						</TableRow>
					{/if}

					<Button
						onclick={() => {
							show = false;
							showForm = true;
						}}
						disabled={data.some((row) => !row.pallets)}
					>
						Editar packing list
					</Button>
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
