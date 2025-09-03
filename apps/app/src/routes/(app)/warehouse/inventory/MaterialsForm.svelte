<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { FileInput, Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import { createQuery } from '@tanstack/svelte-query';
	import { Textarea } from '$lib/components/ui/textarea';

	const clientsQuery = createQuery({
		queryKey: ['inventory-clients'],
		queryFn: async () => (await api.get('/inventoryvarious/clients')).data
	});

	interface Props {
		show?: boolean;
		selectedMaterial: any;
	}

	let { show = $bindable(false), selectedMaterial = $bindable() }: Props = $props();
	let formData: any = $state({
		product: false
	});
	let files: FileList | undefined = $state();

	function setFormData() {
		formData = { ...selectedMaterial };
	}

	const measurements = [
		{ name: 'YARDAS', value: 'YD' },
		{ name: 'METROS', value: 'MT' },
		{ name: 'PIEZAS', value: 'PC' },
		{ name: 'PIES', value: 'FT' },
		{ name: 'GALONES', value: 'GAL' }
	];

	const types = [
		{ name: 'Materia prima', value: false, color: 'blue' },
		{ name: 'Producto', value: true, color: 'green' }
	];

	async function handleSubmit() {
		const form = new FormData();
		form.append(
			'json',
			JSON.stringify({
				...formData,
				id: parseInt(formData.id),
				clientId: parseInt(formData.clientId),
				minAmount: formData.minAmount?.toString()
			})
		);
		if (files) form.append('file', files[0]);
		if (selectedMaterial.id) {
			await api.put('materials', form);
			showSuccess('Material actualizado');
		} else {
			await api.post('materials', form);
			showSuccess('Material registrado');
		}

		refetch(['inventory']);
		show = false;
	}

	$effect(() => {
		if (show || true) setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title={selectedMaterial.id ? `Editar ${selectedMaterial.code}` : 'Registrar Material'}
		/>
		<DialogBody grid="2">
			<Label name="Imagen" class="col-span-full">
				<FileInput bind:files />
			</Label>
			<Label name="Codigo">
				<Input bind:value={formData.code} />
			</Label>
			<Label name="Cliente">
				<Select items={$clientsQuery?.data} bind:value={formData.clientId} />
			</Label>
			<Label name="Descripcion" class="col-span-full">
				<Textarea class="resize-none" bind:value={formData.description} />
			</Label>
			<Label name="Ubicacion">
				<Input bind:value={formData.location} />
			</Label>
			<Label name="Tipo">
				<Select items={types} bind:value={formData.product} />
			</Label>
			<Label name="Medida">
				<Select items={measurements} bind:value={formData.measurement} />
			</Label>
			<Label name="Cantidad minima">
				<Input name="" type="text" bind:value={formData.minAmount} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
