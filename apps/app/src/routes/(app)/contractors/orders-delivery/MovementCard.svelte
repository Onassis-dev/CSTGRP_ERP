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
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { CheckIcon } from 'lucide-svelte';
	import { XIcon } from 'lucide-svelte';

	interface Props {
		show: boolean;
		selectedOrder: any;
	}

	let { show = $bindable(), selectedOrder = $bindable() }: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (
			await api.get('/contractors/progress/records', { params: { id: selectedOrder.id } })
		).data;
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
				{selectedOrder?.ref}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l"><CheckIcon class="size-4" /></TableHead>
					<TableHead class="border-l"><XIcon class="size-4" /></TableHead>
					<TableHead>Fecha</TableHead>
					<TableHead>Capturado</TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow class="border-l">
							<TableCell>{row.accepted}</TableCell>
							<TableCell>{row.rejected}</TableCell>
							<TableCell>{formatDate(row.date)}</TableCell>
							<TableCell
								>{format(new Date(row.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell
							>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
