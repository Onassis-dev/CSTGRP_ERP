<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
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

	const activeValues = [
		{ value: true, name: 'Activa' },
		{ value: false, name: 'Inactiva' }
	];

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/computers', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Computadora editada');
		} else {
			await api.post('/computers', formData);
			showSuccess('Computadora registrada');
		}
		refetch(['computers']);
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
				{selectedDevice.id ? `Editar ${selectedDevice.name}` : 'Registrar computadora'}
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-2 gap-4">
					<Label name="Nombre">
						<Input name="text" bind:value={formData.name} />
					</Label>
					<Label name="Usuario">
						<Input name="text" bind:value={formData.owner} />
					</Label>
					<Label name="Anydesk">
						<Input name="text" bind:value={formData.anydesk} />
					</Label>
					<Label name="Anydesk PW">
						<Input name="text" bind:value={formData.anydeskPW} />
					</Label>
					<Label name="PW">
						<Input name="text" bind:value={formData.password} />
					</Label>
					<Label name="Activa">
						<Select items={activeValues} bind:value={formData.active} />
					</Label>
					<Label name="Último Mantenimiento">
						<Input name="text" bind:value={formData.lastMaintance} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
