<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
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
	import { untrack } from 'svelte';

	interface Props {
		show?: boolean;
		selectedArea: any;
	}

	let { show = $bindable(false), selectedArea = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: '',
		captured: false,
		color: '',
		type: 'prod'
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
		if (show || true) formData = untrack(() => ({ ...formData, ...selectedArea }));
	});

	const types = [
		{ value: 'prod', name: 'Produccion' },
		{ value: 'admin', name: 'Administracion' }
	];
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedArea.id ? `Editar ${selectedArea.name}` : 'Registrar Area'} />
		<DialogBody grid="2">
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Es capturada">
				<Checkbox name="text" bind:checked={formData.captured} />
			</Label>
			<Label name="Color">
				<Select class="mt-2" items={colors} bind:value={formData.color} />
			</Label>
			<Label name="Tipo">
				<Select class="mt-2" items={types} bind:value={formData.type} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
