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
		selectedDestinationDirection: any;
	}

	let { show = $bindable(false), selectedDestinationDirection = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: '',
		direction: ''
	});

	function setFormData() {
		formData = { ...selectedDestinationDirection };
	}

	async function handleSubmit() {
		if (selectedDestinationDirection.id) {
			await api.put('/ie/destination-directions', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Dirección de destino editada');
		} else {
			await api.post('/ie/destination-directions', formData);
			showSuccess('Dirección de destino registrada');
		}
		refetch(['destination-directions']);
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
			title={selectedDestinationDirection.id
				? `Editar ${selectedDestinationDirection.name}`
				: 'Registrar dirección de destino'}
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
