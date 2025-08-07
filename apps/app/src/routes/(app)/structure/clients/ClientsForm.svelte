<script lang="ts">
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
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	interface Props {
		show?: boolean;
		selectedPosition: any;
	}

	let { show = $bindable(false), selectedPosition = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: '',
		color: '',
		active: true
	});

	function setFormData() {
		formData = { ...selectedPosition };
	}

	async function handleSubmit() {
		if (selectedPosition.id) {
			await api.put('/clients-list', formData);
			showSuccess('Cliente editado');
		} else {
			await api.post('/clients-list', formData);
			showSuccess('Cliente registrado');
		}
		refetch(['structure-clients']);
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
		if (show) setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title={selectedPosition.id ? `Editar ${selectedPosition.name}` : 'Registrar cliente'}
		/>
		<DialogBody grid="2">
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Color">
				<Select class="" items={colors} bind:value={formData.color} />
			</Label>
			<Label name="Activa">
				<Checkbox name="text" bind:checked={formData.active} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
