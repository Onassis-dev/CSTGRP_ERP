<script lang="ts">
	import { run } from 'svelte/legacy';

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
		selectedMaterial: any;
		selectedClient: any;
	}

	let {
		show = $bindable(),
		selectedMaterial = $bindable(),
		selectedClient = $bindable()
	}: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (
			await api.get('/clients/material/comparison/' + selectedMaterial.id, {
				params: { clientId: selectedClient }
			})
		).data;
	}
	run(() => {
		if (selectedMaterial.id) {
			fetchData();
		}
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid min-h-[90%] grid-rows-[auto_1fr] gap-4 sm:max-w-6xl">
		<DialogHeader>
			<DialogTitle>
				{selectedMaterial.code}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l">REF</TableHead>
					<TableHead>MATERIAL NEEDED</TableHead>
					<TableHead>ISSUED MATERIAL</TableHead>
					<TableHead>OTHER</TableHead>
					<TableHead>INVENTORY</TableHead>
					<TableHead>DATE</TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow>
							<TableCell class="border-l">{row.ref}</TableCell>
							<TableCell>
								{#if row.jobId}
									<Badge color={'gray'}>{row.amount}</Badge>
								{/if}
							</TableCell>
							<TableCell>
								{#if row.jobId}
									<Badge color={'gray'}>
										{(Number(row.amount) + Number(row.extraAmount)).toFixed(2)}
									</Badge>
								{/if}
							</TableCell>
							<TableCell>
								{#if !row.jobId}
									<Badge color={'gray'}>{row.amount}</Badge>
								{/if}
							</TableCell>

							<TableCell><Badge color={'gray'}>{row.balance}</Badge></TableCell>

							<TableCell>{formatDate(row.due)}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
