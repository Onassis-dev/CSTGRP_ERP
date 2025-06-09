<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
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
	import { Textarea } from '$lib/components/ui/textarea';
	import { PlusIcon, X } from 'lucide-svelte';
	import { untrack } from 'svelte';

	interface Props {
		show?: boolean;
		selectedDevice: any;
	}

	let { show = $bindable(false), selectedDevice = $bindable({}) }: Props = $props();
	let formData: any = $state({});
	let search = $state('');

	const basicData = createQuery({
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		refetchInterval: false,
		refetchIntervalInBackground: false,
		queryKey: ['po-basic-data'],
		queryFn: async () => {
			const data = (await api.get('/purchases/orders/basic-data')).data;
			if (!selectedDevice.id) {
				formData = {
					...data,
					folio: data.folio,
					issuer: data.issuer
				};
			}
			return data;
		}
	});

	const businesses = [
		{ value: 1, name: 'BC PET TREATS', color: 'green' },
		{ value: 2, name: 'MPM BAJA', color: 'red' }
	];

	const productsQuery = createQuery({
		queryKey: ['po-products'],
		queryFn: async () =>
			(await api.get('/purchases/orders/products', { params: { code: search } })).data
	});

	function setFormData() {
		formData = {
			...selectedDevice,
			iva: Number(selectedDevice.iva).toFixed(0)
		};
		if (!selectedDevice.id) return (products = []);

		try {
			products = JSON.parse(selectedDevice.products);
		} catch (error) {
			products = selectedDevice.products;
		}
	}

	async function handleSubmit() {
		const result = { ...formData, products, total, comments: formData.comments || null };
		if (selectedDevice.id) {
			result.id = parseInt(formData.id || '');
			await api.put('/purchases/orders', result);
			showSuccess('Orden editada');
		} else {
			await api.post('/purchases/orders', result);
			showSuccess('Orden registrada');
		}

		refetch(['purchases-orders']);
		show = false;
	}

	let products: any[] = $state([]);

	$effect(() => {
		if (show) {
			refetch(['po-basic-data']);
			refetch(['po-products']);
		}
		untrack(() => setFormData());
	});

	const currencies = [
		{ value: 'MXN', name: 'MXN', color: 'green' },
		{ value: 'USD', name: 'USD', color: 'blue' }
	];

	const iva = [
		{ value: '16', name: '16%' },
		{ value: '8', name: '8%' }
	];

	const total: number = $derived(
		products?.reduce((acc, curr) => acc + Number(curr.total), 0) *
			(1 + Number(formData.iva || 0) / 100)
	);
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid h-[90dvh] grid-rows-[auto_1fr] md:max-w-[90dvw]">
		<DialogHeader>
			<DialogTitle>
				{selectedDevice.id ? `Editar orden` : 'Registrar orden'}
				19,500.00</DialogTitle
			>
		</DialogHeader>

		<DialogBody class="grid grid-cols-2 gap-4">
			<div class="flex flex-col gap-4">
				<div class="grid grid-cols-3 gap-4">
					<Label name="Comprador">
						<Input name="text" bind:value={formData.issuer} readonly />
					</Label>
					<Label name="Folio">
						<Input name="text" bind:value={formData.folio} readonly />
					</Label>
					<Label name="Empresa">
						<Select items={businesses} bind:value={formData.business} />
					</Label>
					<Label name="Proveedor" class="col-span-3">
						<Select items={$basicData?.data?.suppliers} bind:value={formData.supplierId} />
					</Label>
				</div>
				<Card class="flex w-full max-w-full flex-col overflow-hidden shadow-none">
					<CardContent class="overflow-y-auto p-0" card>
						<Table class="w-full border-b">
							<TableHeader class="sticky top-0">
								<TableHead></TableHead>
								<TableHead>Descripcion</TableHead>
								<TableHead>Codigo</TableHead>
								<TableHead>Cantidad</TableHead>
								<TableHead>Total</TableHead>
							</TableHeader>
							<TableBody>
								{#each products as row, i}
									<TableRow>
										<TableCell class="p-0.5">
											<Button
												onclick={() => {
													products = products.filter((_, index) => index !== i);
												}}
												variant="ghost"
											>
												<X class="size-3.5 text-red-500" />
											</Button>
										</TableCell>
										<TableCell
											class="whitespace-hidden w-full max-w-80 overflow-hidden text-ellipsis"
											>{row.description || ''}</TableCell
										>
										<TableCell>{row.code || ''}</TableCell>
										<TableCell class="p-[1px]">
											<Input
												bind:value={row.quantity}
												oninput={() => {
													row.total = row.quantity * row.price;
												}}
												type="number"
												min={0}
												class="w-24 rounded-none border-none"
											/>
										</TableCell>
										<TableCell>{Number(row.total).toFixed(2)}</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				<div class="grid grid-cols-3 gap-4">
					<Label name="Moneda">
						<Select items={currencies} bind:value={formData.currency} placeholder="Moneda" />
					</Label>
					<Label name="Iva">
						<Select items={iva} bind:value={formData.iva} placeholder="Iva" />
					</Label>
					<Label name="Total">
						<Input value={Number(total).toFixed(2)} type="text" readonly />
					</Label>
					<Label name="Comentarios" class="col-span-3 resize-none">
						<Textarea bind:value={formData.comments} />
					</Label>

					<Button onclick={handleSubmit}>Guardar</Button>
				</div>
			</div>
			<Card class="flex w-full max-w-full flex-col overflow-hidden shadow-none">
				<CardHeader>
					<Input
						bind:value={search}
						placeholder="Buscar..."
						oninput={() => {
							refetch(['po-products']);
						}}
					/>
				</CardHeader>

				<CardContent class="overflow-y-auto px-0 pb-0 " card>
					<Table class="w-full border-b">
						<TableHeader class="sticky top-0">
							<TableHead>Codigo</TableHead>
							<TableHead class="w-full">Descripcion</TableHead>
							<TableHead>Precio</TableHead>
							<TableHead></TableHead>
						</TableHeader>
						<TableBody>
							{#each $productsQuery?.data || [] as row}
								<TableRow>
									<TableCell>{row.code || ''}</TableCell>
									<TableCell class="whitespace-hidden max-w-64 overflow-hidden text-ellipsis"
										>{row.description || ''}</TableCell
									>
									<TableCell>{row.price || ''}</TableCell>

									<TableCell class="p-0.5">
										<Button
											onclick={() => {
												if (products?.find((material) => material.id === row.id)) return;
												products = [
													...products,
													{
														id: row.id,
														code: row.code,
														measurement: row.measurement,
														description: row.description,
														price: row.price,
														quantity: 1,
														total: row.price
													}
												];
											}}
											variant="ghost"
										>
											<PlusIcon class="size-3.5 text-green-500" />
										</Button>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</DialogBody>
	</DialogContent>
</Dialog>
