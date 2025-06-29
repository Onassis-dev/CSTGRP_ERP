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
		selectedEmail: any;
	}

	let { show = $bindable(false), selectedEmail = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedEmail };
	}

	async function handleSubmit() {
		if (selectedEmail.id) {
			await api.put('/emails', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Correo editada');
		} else {
			await api.post('/emails', formData);
			showSuccess('Correo registrada');
		}
		refetch(['emails']);
		show = false;
	}
	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedEmail.id ? `Editar ${selectedEmail.email}` : 'Registrar correo'} />

		<DialogBody grid="2">
			<Label name="Correo">
				<Input name="text" bind:value={formData.email} />
			</Label>
			<Label name="Contrasena">
				<Input name="text" bind:value={formData.password} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
