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
		selectedCarrier: any;
	}

	let { show = $bindable(false), selectedCarrier = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: ''
	});

	function setFormData() {
		formData = { ...selectedCarrier };
	}

	async function handleSubmit() {
		if (selectedCarrier.id) {
			await api.put('/ie/carriers', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Transportista editado');
		} else {
			await api.post('/ie/carriers', formData);
			showSuccess('Transportista registrado');
		}
		refetch(['carriers']);
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
			title={selectedCarrier.id ? `Editar ${selectedCarrier.name}` : 'Registrar transportista'}
		/>
		<DialogBody>
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
