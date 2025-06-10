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
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { untrack } from 'svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';

	interface Props {
		show?: boolean;
		selectedDevice: any;
	}

	let { show = $bindable(false), selectedDevice = $bindable({}) }: Props = $props();
	let formData: any = $state();
	let selectedSuppliers = $state<any[]>([]);

	const categories = createQuery({
		queryKey: ['purchases-categories'],
		queryFn: async () => (await api.get('/purchases/products/categories')).data
	});

	const suppliers = createQuery({
		queryKey: ['purchases-suppliers'],
		queryFn: async () => (await api.get('/purchases/products/suppliers')).data
	});

	async function setFormData() {
		formData = {
			...selectedDevice,
			bornDate: selectedDevice.bornDate?.split('T')[0]
		};
		if (formData.id) {
			selectedSuppliers = (await api.get(`/purchases/products/suppliers/${formData.id}`)).data;
		} else {
			selectedSuppliers = [];
		}
	}

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/purchases/products', {
				...formData,
				suppliers: selectedSuppliers,
				id: parseInt(formData.id || '')
			});
			showSuccess('Categoria editada');
		} else {
			await api.post('/purchases/products', {
				...formData,
				suppliers: selectedSuppliers
			});
			showSuccess('Producto registrado');
		}
		refetch(['purchases-products']);
		show = false;
	}

	$effect(() => {
		show;
		if (!show) formData = {};
		untrack(() => {
			setFormData();
		});
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="max-w-4xl">
		<DialogHeader>
			<DialogTitle class="grid grid-cols-2 gap-4">
				<span>{selectedDevice.id ? `Editar producto` : 'Registrar producto'}</span>
				<span>Proveedores: {selectedSuppliers.length || 0}</span>
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<div class="grid grid-cols-2 gap-4">
				<form onsubmit={preventDefault(handleSubmit)}>
					<div class="grid grid-cols-2 gap-4">
						<Label name="Categoría">
							<Select items={$categories?.data} bind:value={formData.categoryId} />
						</Label>
						<Label name="Codigo">
							<Input name="text" bind:value={formData.code} />
						</Label>
						<Label name="Descripción" class="col-span-2">
							<Textarea name="text" bind:value={formData.description} />
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
				<div
					class="grid max-h-96 grid-cols-[1fr_auto] gap-3 overflow-y-auto rounded-xl border p-1 px-2"
				>
					{#each $suppliers?.data as supplier}
						<Label
							labelClass={selectedSuppliers.includes(supplier.value) ? 'text-foreground' : ''}
							name={supplier.name + ' ' + supplier.value}
						/>
						<Checkbox
							checked={selectedSuppliers.includes(supplier.value)}
							onCheckedChange={() => {
								if (selectedSuppliers.includes(supplier.value)) {
									selectedSuppliers = selectedSuppliers.filter((id: any) => id !== supplier.value);
								} else {
									selectedSuppliers = [...selectedSuppliers, supplier.value];
								}
							}}
						/>
					{/each}
				</div>
			</div>
		</DialogBody>
	</DialogContent>
</Dialog>
