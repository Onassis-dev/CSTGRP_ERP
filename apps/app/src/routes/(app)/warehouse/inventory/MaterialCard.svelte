<script lang="ts">
	import { run } from 'svelte/legacy';

	import { Image } from 'lucide-svelte';
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

	interface Props {
		show: boolean;
		selectedMaterial: any;
	}

	let { show = $bindable(), selectedMaterial }: Props = $props();

	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (await api.get('/inventory/history/' + selectedMaterial.id)).data;
	}
	run(() => {
		if (selectedMaterial.id) {
			fetchData();
		}
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid h-[90%] max-w-6xl grid-rows-[auto_1fr] gap-4">
		<DialogHeader>
			<DialogTitle>
				{selectedMaterial.code}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<div class="mb-4">Ubicacion: {selectedMaterial.location}</div>
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
							<TableCell>{formatDate(row.due)}</TableCell>
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
