<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { PlusCircle } from 'lucide-svelte';

	interface Props {
		show?: boolean;
		selectedPosition: any;
	}

	let { show = $bindable(false), selectedPosition = $bindable({}) }: Props = $props();

	let rows: any[] = $state([]);
	let showForm = $state(false);
	let showDelete = $state(false);
	let selectedRow: any = $state({});
	let formData = $state({ part: '', price: '' as string | number });

	async function fetchData() {
		if (!selectedPosition?.id) return;
		rows = (await api.get('/contractors-prices', { params: { contractorId: selectedPosition.id } }))
			.data;
	}

	function openCreate() {
		selectedRow = {};
		formData = { part: '', price: '' };
		showForm = true;
	}

	function openEdit(row: any) {
		selectedRow = row;
		formData = { part: row.part ?? '', price: row.price ?? '' };
		showForm = true;
	}

	function openDelete(row: any) {
		selectedRow = row;
		showDelete = true;
	}

	async function handleSubmit() {
		const part = String(formData.part ?? '').trim();
		const price = Number(formData.price);
		if (!part || Number.isNaN(price)) return;

		const contractorId = selectedPosition.id;
		const payload = { contractorId, part, price };

		if (selectedRow.id) {
			await api.put('/contractors-prices', { ...payload, id: selectedRow.id });
			showSuccess('Precio editado');
		} else {
			await api.post('/contractors-prices', payload);
			showSuccess('Precio registrado');
		}
		await fetchData();
		showForm = false;
	}

	$effect(() => {
		if (show && selectedPosition?.id) {
			void fetchData();
		}
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid max-h-[90vh] grid-rows-[auto_1fr] gap-4 sm:max-w-2xl">
		<DialogHeader>
			<DialogTitle>Precios de {selectedPosition?.name ?? ''}</DialogTitle>
		</DialogHeader>
		<DialogBody class="max-h-full min-h-0 overflow-auto">
			<div class="mb-4 flex justify-end">
				<Button onclick={openCreate} disabled={!selectedPosition?.id}>
					<PlusCircle class="size-3.5" />
					Añadir precio
				</Button>
			</div>
			<Table class="border-l">
				<TableHeader class="sticky top-0 z-[1] border-t bg-background">
					<OptionsHead />
					<TableHead class="w-full">Parte</TableHead>
					<TableHead>Precio</TableHead>
				</TableHeader>
				<TableBody>
					{#each rows as row}
						<TableRow>
							<OptionsCell
								editFunc={() => openEdit(row)}
								deleteFunc={() => openDelete(row)}
							/>
							<TableCell class="border-l">{row.part}</TableCell>
							<TableCell class="border-l">{row.price}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>

<Dialog bind:open={showForm}>
	<DialogContent>
		<DialogHeader title={selectedRow.id ? 'Editar precio' : 'Registrar precio'} />
		<DialogBody grid="2">
			<Label name="Parte">
				<Input name="part" bind:value={formData.part} />
			</Label>
			<Label name="Precio">
				<Input type="number" step="any" name="price" bind:value={formData.price} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (showForm = false)} />
	</DialogContent>
</Dialog>

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar precio"
	deleteFunc={async () => {
		await api.delete('/contractors-prices', { data: { id: selectedRow.id } });
		showSuccess('Precio eliminado');
		await fetchData();
		showDelete = false;
	}}
/>
