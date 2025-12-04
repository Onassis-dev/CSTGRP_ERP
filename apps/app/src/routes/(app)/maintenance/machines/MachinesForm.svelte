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
	import { createQuery } from '@tanstack/svelte-query';
	import { getAreas, getOptions } from '$lib/utils/queries';
	import { Textarea } from '$lib/components/ui/textarea';

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
		{ value: 'true', name: 'Activa', color: 'green' },
		{ value: 'false', name: 'Inactiva', color: 'red' }
	];

	const areasQuery = createQuery({
		queryKey: ['maintenance-areas'],
		queryFn: getAreas
	});
	let areas = $derived(getOptions($areasQuery.data));

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/maintenance/machines', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Máquina editada');
		} else {
			await api.post('/maintenance/machines', formData);
			showSuccess('Máquina registrada');
		}
		refetch(['machines']);
		show = false;
	}
	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title={selectedDevice.id ? `Editar ${selectedDevice.publicId}` : 'Registrar máquina'}
		/>

		<DialogBody grid="2">
			<Label name="ID">
				<Input name="text" bind:value={formData.publicId} />
			</Label>
			<Label name="Marca">
				<Input name="text" bind:value={formData.brand} />
			</Label>
			<Label name="Descripción" class="col-span-full">
				<Textarea class="resize-none" name="text" bind:value={formData.description} />
			</Label>
			<Label name="Modelo">
				<Input name="text" bind:value={formData.model} />
			</Label>
			<Label name="Serial">
				<Input name="text" bind:value={formData.serial} />
			</Label>
			<Label name="Pedimento">
				<Input name="text" bind:value={formData.pediment} />
			</Label>
			<Label name="Activa">
				<Select items={activeValues} bind:value={formData.active} />
			</Label>
			<Label name="Área">
				<Select items={areas} bind:value={formData.areaId} allowDeselect />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
