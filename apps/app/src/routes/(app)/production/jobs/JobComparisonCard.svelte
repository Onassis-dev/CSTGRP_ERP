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
	import api from '$lib/utils/server';

	interface Props {
		show: boolean;
		selectedJob: any;
	}

	let { show = $bindable(), selectedJob = $bindable({}) }: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (await api.get('/jobs/comparison/' + selectedJob.id)).data;
	}

	$effect(() => {
		if (selectedJob.id) fetchData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid min-h-[90%] grid-rows-[auto_1fr] gap-4 sm:max-w-6xl">
		<DialogHeader>
			<DialogTitle>
				{selectedJob.ref}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead>Material</TableHead>
					<TableHead>Cantidad Job</TableHead>
					<TableHead>Cantidad real</TableHead>
					<TableHead>Medida</TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow>
							<TableCell class="border-l">{row.code}</TableCell>
							<TableCell><Badge color={'gray'}>{row.amount}</Badge></TableCell>
							<TableCell
								><Badge
									color={row.realAmount === row.amount
										? 'gray'
										: parseFloat(row.realAmount) > parseFloat(row.amount)
											? 'green'
											: 'red'}
									>{row.realAmount}
								</Badge>
							</TableCell>
							<TableCell>{row.measurement}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
