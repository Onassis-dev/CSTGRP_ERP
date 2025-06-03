<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
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
		<DialogHeader>
			<DialogTitle>
				{selectedEmail.id ? `Editar ${selectedEmail.email}` : 'Registrar correo'}
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-2 gap-4">
					<Label name="Correo">
						<Input name="text" bind:value={formData.email} />
					</Label>
					<Label name="Contrasena">
						<Input name="text" bind:value={formData.password} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
