<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
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
		selectedJob: any;
	}

	let { show = $bindable(), selectedJob = $bindable({}) }: Props = $props();

	let data: any = $state({});

	async function fetchData() {
		data = (await api.get('/orders/' + selectedJob.id)).data;
		console.log(data);
	}

	$effect(() => {
		if (selectedJob.id) fetchData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid h-[90%] max-w-6xl grid-rows-[auto_1fr] gap-4">
		<DialogHeader>
			<DialogTitle>
				{selectedJob.jobpo}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<Table>
				<TableHeader class="sticky top-0 border-b border-t">
					<TableHead class="border-b">Fecha</TableHead>
					<TableHead class="border-b">Cortes</TableHead>
					<TableHead class="border-b">Cortes Varios</TableHead>
					<TableHead class="border-b">Producción</TableHead>
					<TableHead class="border-b">Serigrafía</TableHead>
					<TableHead class="border-b">Calidad</TableHead>
				</TableHeader>
				<TableBody class="border-t">
					{#each data.movements as row}
						<TableRow>
							<TableCell class="border-l">{formatDate(row.created_at)}</TableCell>
							<TableCell class="border-l">{row.corte}</TableCell>
							<TableCell class="border-l">{row.cortesVarios}</TableCell>
							<TableCell class="border-l">{row.produccion}</TableCell>
							<TableCell class="border-l">{row.serigrafia}</TableCell>
							<TableCell class="border-l">{row.calidad}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
