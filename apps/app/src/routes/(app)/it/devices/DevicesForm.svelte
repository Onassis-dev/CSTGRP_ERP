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
		selectedDevice: any;
	}

	let { show = $bindable(false), selectedDevice = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedDevice };
	}

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/devices', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Dispositivo editado');
		} else {
			await api.post('/devices', formData);
			showSuccess('Dispositivo registrado');
		}
		refetch(['devices']);
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
				{selectedDevice.id ? `Editar ${selectedDevice.name}` : 'Registrar dispositivo'}
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-2 gap-4">
					<Label name="Nombre">
						<Input name="text" bind:value={formData.name} />
					</Label>
					<Label name="IP">
						<Input name="text" bind:value={formData.ip} />
					</Label>
					<Label name="Usuario">
						<Input name="text" bind:value={formData.user} />
					</Label>
					<Label name="Contrasena">
						<Input name="text" bind:value={formData.password} />
					</Label>
					<Label name="Wifi">
						<Input name="text" bind:value={formData.wifipw} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
