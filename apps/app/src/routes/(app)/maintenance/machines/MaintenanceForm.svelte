<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		show?: boolean;
		selectedDevice: any;
		machineId: number;
		reload: () => void;
	}

	let {
		show = $bindable(false),
		selectedDevice = $bindable({}),
		machineId,
		reload
	}: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedDevice, date: selectedDevice.date?.split('T')[0] };
	}

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/maintenance/maintenances', {
				...formData,
				machineId
			});
			showSuccess('Mantenimiento editado');
		} else {
			await api.post('/maintenance/maintenances', { ...formData, machineId });
			showSuccess('Mantenimiento registrado');
		}
		reload();
		show = false;
	}
	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedDevice.id ? `Editar Mantenimiento` : 'Registrar mantenimiento'} />

		<DialogBody>
			<Label name="Descripción">
				<Textarea class="resize-none" name="text" bind:value={formData.description} />
			</Label>
			<Label name="Fecha">
				<Input type="date" bind:value={formData.date} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
