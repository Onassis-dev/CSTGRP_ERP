<script lang="ts">
	import { run, preventDefault } from 'svelte/legacy';

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

	interface Props {
		show?: boolean;
		reload: any;
		selectedPosition: any;
	}

	let { show = $bindable(false), reload, selectedPosition = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedPosition };
	}

	async function handleSubmit() {
		if (selectedPosition.id) {
			await api.put('/positions', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Posicion editada');
		} else {
			await api.post('/positions', formData);
			showSuccess('Posicion registrada');
		}
		await reload();
		show = false;
	}

	let colors = [
		{ value: 'gray', name: 'Gris' },
		{ value: 'red', name: 'Rojo' },
		{ value: 'brown', name: 'Marrón' },
		{ value: 'orange', name: 'Naranja' },
		{ value: 'lime', name: 'Lima' },
		{ value: 'green', name: 'Verde' },
		{ value: 'cyan', name: 'Cian' },
		{ value: 'blue', name: 'Azul' },
		{ value: 'purple', name: 'Morado' },
		{ value: 'yellow', name: 'Amarillo' },
		{ value: 'pink', name: 'Rosa' }
	];
	run(() => {
		if (show || true) setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>
				{selectedPosition.id ? `Editar ${selectedPosition.name}` : 'Registrar posicion'}
			</DialogTitle>
		</DialogHeader>
		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-2 gap-4">
					<Label name="Nombre">
						<Input name="text" bind:value={formData.name} />
					</Label>
					<Label name="Color">
						<Select class="mt-2" items={colors} bind:value={formData.color} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
