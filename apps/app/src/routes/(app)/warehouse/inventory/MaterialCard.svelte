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
	import { formatDate, getImage } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Download } from 'lucide-svelte';
	import { downloadFile } from '$lib/utils/files';

	interface Props {
		show: boolean;
		selectedMaterial: any;
	}

	let { show = $bindable(), selectedMaterial = $bindable() }: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (await api.get('/inventory/history/' + selectedMaterial.id)).data;
	}

	$effect(() => {
		if (selectedMaterial.id) fetchData();
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
			<div class="mb-4 flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onclick={() =>
						downloadFile({
							url: '/inventory/history/download/' + selectedMaterial.id,
							name: `${selectedMaterial.code}.xlsx`
						})}
				>
					<Download />
				</Button>
				<div>Ubicacion: {selectedMaterial.location}</div>
			</div>
			<img src={getImage(selectedMaterial.image)} alt="" class="w-full" />

			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l">job</TableHead>
					<TableHead>Programacion</TableHead>
					<TableHead>Importacion</TableHead>
					<TableHead>Cantidad Job</TableHead>
					<TableHead>Cantidad real</TableHead>
					<TableHead>Fecha</TableHead>
					<TableHead>Balance</TableHead>
					<TableHead>Balance total</TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow>
							<TableCell class="border-l">{(row.jobpo || '') + (row.extra ? ' -R' : '')}</TableCell>
							<TableCell>{row.programation || ''}</TableCell>
							<TableCell>{row.import || ''}</TableCell>
							<TableCell
								><Badge color={parseFloat(row.amount) > 0 ? 'green' : 'red'}>{row.amount}</Badge
								></TableCell
							>
							<TableCell
								><Badge color={parseFloat(row.realAmount) > 0 ? 'green' : 'red'}
									>{row.realAmount}</Badge
								></TableCell
							>
							<TableCell>{formatDate(row.activeDate)}</TableCell>
							<TableCell
								><Badge color={parseFloat(row.balance) > 0 ? 'green' : 'red'}>{row.balance}</Badge
								></TableCell
							>
							<TableCell
								><Badge color={parseFloat(row.balance) > 0 ? 'green' : 'red'}
									>{row.totalBalance}</Badge
								></TableCell
							>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>
