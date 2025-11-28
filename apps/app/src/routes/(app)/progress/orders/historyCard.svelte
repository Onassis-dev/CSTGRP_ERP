<script lang="ts">
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
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
	import { refetch } from '$lib/utils/query';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { Pen, Trash } from 'lucide-svelte';
	import HistoryForm from './historyForm.svelte';

	interface Props {
		show: boolean;
		selectedOrder: any;
	}

	let { show = $bindable(), selectedOrder = $bindable() }: Props = $props();

	let movements: any[] = $state([]);
	let showDelete: boolean = $state(false);
	let showForm: boolean = $state(false);
	let selectedMovement: any = $state({});

	async function fetchData() {
		movements = (await api.get('/progress/history', { params: { id: selectedOrder.id } })).data;
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
					<TableHead>Codigo</TableHead>
					<TableHead class="border-l">Cantidad</TableHead>
					<TableHead>Fecha</TableHead>
					<TableHead class="w-1"></TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow class="border-l">
							<TableCell>{row.code}</TableCell>
							<TableCell>{row.added}</TableCell>
							<TableCell>{formatDate(row.date)}</TableCell>
							<TableCell class="flex w-min items-center gap-1 px-1 ">
								<Button
									size="icon"
									variant="outline"
									onclick={() => {
										selectedMovement = row;
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

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar movimiento"
	deleteFunc={async () => {
		await api.delete('/progress/history', { data: { id: selectedMovement.id } });
		fetchData();
		refetch(['progress-orders']);
		showSuccess('Movimiento eliminado');
		showDelete = false;
	}}
/>

<HistoryForm bind:show={showForm} {selectedMovement} refetchFunc={fetchData} />
