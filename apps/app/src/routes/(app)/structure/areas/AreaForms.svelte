<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
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
	import { untrack } from 'svelte';

	interface Props {
		show?: boolean;
		selectedArea: any;
	}

	let { show = $bindable(false), selectedArea = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: '',
		captured: false,
		color: ''
	});

	async function handleSubmit() {
		if (selectedArea.id) {
			await api.put('/areas', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Area editada');
		} else {
			await api.post('/areas', formData);
			showSuccess('Area registrada');
		}
		refetch(['structure-areas']);
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
	$effect(() => {
		if (show || true) formData = untrack(() => ({ ...formData, ...selectedArea }));
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>
				{selectedArea.id ? `Editar ${selectedArea.name}` : 'Registrar Area'}
			</DialogTitle>
		</DialogHeader>
		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-2 gap-4">
					<Label name="Nombre">
						<Input name="text" bind:value={formData.name} />
					</Label>
					<Label name="Es capturada">
						<Checkbox name="text" bind:checked={formData.captured} />
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
