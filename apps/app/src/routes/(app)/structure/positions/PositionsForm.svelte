<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
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
		selectedPosition: any;
	}

	let { show = $bindable(false), selectedPosition = $bindable({}) }: Props = $props();
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
		refetch(['structure-positions']);
		show = false;
	}

	let colors = [
		{ value: 'gray', name: 'Gris', color: 'gray' },
		{ value: 'red', name: 'Rojo', color: 'red' },
		{ value: 'orange', name: 'Naranja', color: 'orange' },
		{ value: 'lime', name: 'Lima', color: 'lime' },
		{ value: 'green', name: 'Verde', color: 'green' },
		{ value: 'cyan', name: 'Cian', color: 'cyan' },
		{ value: 'blue', name: 'Azul', color: 'blue' },
		{ value: 'purple', name: 'Morado', color: 'purple' },
		{ value: 'yellow', name: 'Amarillo', color: 'yellow' },
		{ value: 'pink', name: 'Rosa', color: 'pink' }
	];
	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title={selectedPosition.id ? `Editar ${selectedPosition.name}` : 'Registrar posicion'}
		/>
		<DialogBody grid="2">
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Color">
				<Select class="" items={colors} bind:value={formData.color} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
