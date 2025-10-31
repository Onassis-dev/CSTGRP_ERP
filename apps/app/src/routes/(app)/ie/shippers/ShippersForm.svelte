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
		selectedShipper: any;
	}

	let { show = $bindable(false), selectedShipper = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: ''
	});

	function setFormData() {
		formData = { ...selectedShipper };
	}

	async function handleSubmit() {
		if (selectedShipper.id) {
			await api.put('/ie/shippers', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Transporte editado');
		} else {
			await api.post('/ie/shippers', formData);
			showSuccess('Transporte registrado');
		}
		refetch(['shippers']);
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
			title={selectedShipper.id ? `Editar ${selectedShipper.name}` : 'Registrar Transporte'}
		/>
		<DialogBody>
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
