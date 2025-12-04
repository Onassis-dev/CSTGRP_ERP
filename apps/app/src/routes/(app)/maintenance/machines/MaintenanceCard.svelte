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
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import MaintenanceForm from './MaintenanceForm.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PlusCircle } from 'lucide-svelte';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	interface Props {
		show: boolean;
		selectedMachine: any;
	}

	let { show = $bindable(), selectedMachine = $bindable() }: Props = $props();

	let showForm = $state(false);
	let showDelete = $state(false);
	let selectedMaintenance: any = $state({});
	let movements: any[] = $state([]);

	async function fetchData() {
		movements = (await api.get('/maintenance/maintenances/' + selectedMachine.id)).data;
	}

	$effect(() => {
		if (selectedMachine.id) fetchData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid min-h-[90%] grid-rows-[auto_1fr] gap-4 sm:max-w-2xl">
		<DialogHeader>
			<DialogTitle>
				{selectedMachine.publicId}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<div class="mb-4 flex justify-end">
				<Button
					onclick={() => {
						selectedMaintenance = {};
						showForm = true;
					}}
				>
					<PlusCircle class="size-3.5" />
					Añadir mantenimiento
				</Button>
			</div>
			<Table class="border-l">
				<TableHeader class="sticky top-0 border-t">
					<OptionsHead />
					<TableHead class="w-full">Descripción</TableHead>
					<TableHead>Fecha</TableHead>
				</TableHeader>
				<TableBody>
					{#each movements as row}
						<TableRow>
							<OptionsCell
								editFunc={() => {
									selectedMaintenance = row;
									showForm = true;
								}}
								deleteFunc={() => {
									selectedMaintenance = row;
									showDelete = true;
								}}
							/>
							<TableCell class="border-l">{row.description}</TableCell>

							<TableCell class="border-l">{formatDate(row.date)}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
	</DialogContent>
</Dialog>

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar mantenimiento"
	deleteFunc={async () => {
		await api.delete('/maintenance/maintenances', { data: { id: selectedMaintenance.id } });
		fetchData();
		showSuccess('Mantenimiento eliminado');
		showDelete = false;
	}}
/>
<MaintenanceForm
	bind:show={showForm}
	selectedDevice={selectedMaintenance}
	machineId={selectedMachine.id}
	reload={fetchData}
/>
