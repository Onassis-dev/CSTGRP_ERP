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
	import { formatDate } from '$lib/utils/functions';
	import api from '$lib/utils/server';

	interface Props {
		show: boolean;
		selectedOrder: any;
		area: string;
	}

	let { show = $bindable(), selectedOrder = $bindable(), area }: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (await api.get('/progress/records', { params: { id: selectedOrder.id, area } }))
			.data;
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
					<TableHead class="border-l">Cantidad</TableHead>
					<TableHead>Fecha</TableHead>
					<TableHead>Capturado</TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow>
							<TableCell class="border-l">{row[area]}</TableCell>
							<TableCell>{formatDate(row.date)}</TableCell>
							<TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
