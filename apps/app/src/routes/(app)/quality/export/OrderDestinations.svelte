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
	import Label from '$lib/components/basic/Label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { SaveIcon } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { showError, showSuccess } from '$lib/utils/showToast';
	interface Props {
		show: boolean;
		selectedRow: any;
	}

	let { show = $bindable(), selectedRow = $bindable() }: Props = $props();

	let data: Record<string, any> | null = $state(null);

	async function fetchData() {
		data = (await api.get('/quality/orders/destinations', { params: { id: selectedRow.id } })).data;
	}

	$effect(() => {
		if (selectedRow.id) fetchData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[50%] sm:max-w-2xl">
		<DialogHeader>
			<DialogTitle>
				{data?.ref}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<div class="mb-4 grid grid-cols-3 gap-2">
				<Label name="Programación">
					<Input readonly value={data?.programation ?? ''} />
				</Label>
				<Label name="Job PO">
					<Input readonly value={data?.ref ?? ''} />
				</Label>
				<Label name="Parte">
					<Input readonly value={data?.part ?? ''} />
				</Label>
				<Label name="Cantidad">
					<Input readonly value={data?.amount ?? ''} />
				</Label>
				<Label name="Pz/Caja">
					<Input readonly value={data?.perBox ?? ''} />
				</Label>
				<Label name="Due Date">
					<Input readonly value={formatDate(data?.due) ?? ''} />
				</Label>
			</div>
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l">SO</TableHead>
					<TableHead class="border-l">Cantidad</TableHead>
					<TableHead class="border-l">Fecha</TableHead>
					<TableHead class="border-l">Pallets</TableHead>
				</TableHeader>
				<TableBody>
					{#each data?.destinations as row}
						<TableRow>
							<TableCell class="border-l">{row.so}</TableCell>
							<TableCell>{row.amount}</TableCell>
							<TableCell>{formatDate(row.date)}</TableCell>
							<TableCell class="w-24 p-0">
								<div class="flex items-center">
									<Input class="rounded-none border-none" maxlength={3} bind:value={row.pallets} />

									<Button
										class="aspect-square size-8 p-0"
										onclick={async () => {
											if (!row.pallets) return showError(null, 'Numero invalido');
											await api.put('/quality/orders/destinations', {
												id: row.id,
												pallets: row.pallets
											});
											showSuccess('Pallets actualizados');
										}}
									>
										<SaveIcon class="size-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
					{#if data?.destinations.length === 0}
						<TableRow>
							<TableCell class="text-muted-foreground border-l text-center" colspan={100}
								>No hay destinos</TableCell
							>
						</TableRow>
					{/if}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
