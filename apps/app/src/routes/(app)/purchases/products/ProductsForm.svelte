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
	import Select from '$lib/components/basic/Select.svelte';
	import { createQuery } from '@tanstack/svelte-query';

	interface Props {
		show?: boolean;
		selectedDevice: any;
	}

	let { show = $bindable(false), selectedDevice = $bindable({}) }: Props = $props();
	let formData: any = $state();

	const categories = createQuery({
		queryKey: ['purchases-categories'],
		queryFn: async () => (await api.get('/purchases/products/categories')).data
	});

	function setFormData() {
		formData = {
			...selectedDevice,
			bornDate: selectedDevice.bornDate?.split('T')[0]
		};
	}

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/purchases/products', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Categoria editada');
		} else {
			await api.post('/purchases/products', formData);
			showSuccess('Producto registrado');
		}
		refetch(['purchases-products']);
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
				{selectedDevice.id ? `Editar producto` : 'Registrar producto'}
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid grid-cols-2 gap-4">
					<Label name="Categoría">
						<Select items={$categories?.data} bind:value={formData.categoryId} />
					</Label>
					<Label name="Codigo">
						<Input name="text" bind:value={formData.code} />
					</Label>
					<Label name="Descripción">
						<Input name="text" bind:value={formData.description} />
					</Label>
					<Label name="Medida">
						<Input name="text" bind:value={formData.measurement} />
					</Label>
					<Label name="Precio">
						<Input name="text" bind:value={formData.price} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
