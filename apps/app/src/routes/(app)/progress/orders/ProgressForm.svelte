<script lang="ts">
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableHeader,
		TableHead,
		TableRow,
		TableCell
	} from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import CaptureProgress from './CaptureProgress.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PlusCircle } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	interface Props {
		show?: boolean;
		selectedOrder: any;
	}

	let { show = $bindable(false), selectedOrder = $bindable({}) }: Props = $props();
	let data: any = $state([]);
	let showCaptureProgress: boolean = $state(false);
	let selectedOperation: any = $state({});

	async function fetchData() {
		data = (await api.get('/progress/orders/' + selectedOrder.id)).data;
	}

	$effect(() => {
		if (selectedOrder.id) fetchData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={`${data?.jobpo} (${data?.amount}pz)`} />

		<DialogBody>
			<Table>
				<TableHeader class="border-t">
					<TableHead>Codigo</TableHead>
					<TableHead>Progreso</TableHead>
					<TableHead class="w-1"></TableHead>
				</TableHeader>
				<TableBody>
					{#each data.operations as operation}
						<TableRow class="border-l">
							<TableCell>{operation.code}</TableCell>
							<TableCell
								class={cn(Number(operation.progress) === Number(data.amount) && 'text-green-700')}
								>{operation.progress}</TableCell
							>
							<TableCell class="p-0">
								<Button
									variant="ghost"
									class="size-8 rounded-none border-none"
									onclick={() => {
										selectedOperation = operation;
										showCaptureProgress = true;
									}}><PlusCircle class="size-4" /></Button
								>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
		<DialogFooter hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>

<CaptureProgress bind:show={showCaptureProgress} {selectedOperation} reload={fetchData} />
