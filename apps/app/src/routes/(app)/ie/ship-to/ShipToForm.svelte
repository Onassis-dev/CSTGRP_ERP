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
	import { refetch } from '$lib/utils/query';

	interface Props {
		show?: boolean;
		selectedShipTo: any;
	}

	let { show = $bindable(false), selectedShipTo = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: '',
		direction: ''
	});

	function setFormData() {
		formData = { ...selectedShipTo };
	}

	async function handleSubmit() {
		if (selectedShipTo.id) {
			await api.put('/ie/ship-to', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Ship to editado');
		} else {
			await api.post('/ie/ship-to', formData);
			showSuccess('Ship to registrado');
		}
		refetch(['ship-to']);
		show = false;
	}

	$effect(() => {
		show;
		setFormData();
	});

	$inspect(formData);
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title={selectedShipTo.id
				? `Editar ${selectedShipTo.name}`
				: 'Registrar ship to'}
		/>
		<DialogBody>
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Dirección">
				<Input name="direction" bind:value={formData.direction} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>

