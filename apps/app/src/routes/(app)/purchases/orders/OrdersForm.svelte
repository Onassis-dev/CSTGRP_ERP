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
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import Select from '$lib/components/basic/Select.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Filter, PlusIcon, X } from 'lucide-svelte';
	import { untrack } from 'svelte';
	import { cn } from '$lib/utils';

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
					...formData,
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
			(
				await api.get('/purchases/orders/products', {
					params: {
						code: search,
						supplierId: filter && formData.supplierId ? formData.supplierId : null
					}
				})
			).data
	});

	function setFormData() {
		formData = {
			...selectedDevice,
			iva: Number(selectedDevice.iva).toFixed(0)
		};
		if (!selectedDevice.products) return (products = []);

		try {
			products = JSON.parse(selectedDevice.products);
		} catch (error) {
			products = selectedDevice.products;
		}
		products = products.map((product) => {
			return {
				...product,
				total: Number(product.total).toFixed(4)
			};
		});
	}

	async function handleSubmit() {
		const result = { ...formData, products, total, comments: formData.comments || null };
		if (selectedDevice.id) {
			result.id = parseInt(formData.id || '');
			await api.put('/purchases/orders', result);
			showSuccess('Orden editada');
		} else {
			delete result.id;
			await api.post('/purchases/orders', result);
			showSuccess('Orden registrada');
		}

		refetch(['purchases-orders']);
		show = false;
	}

	let products: any[] = $state([]);
	let filter = $state(true);

	$effect(() => {
		show;
		untrack(() => {
			if (show) {
				refetch(['po-basic-data']);
			}
			if (!show) {
				selectedDevice = {};
				filter = true;
				search = '';
			}
			setFormData();
			refetch(['po-products']);
		});
	});

	const currencies = [
		{ value: 'MXN', name: 'MXN', color: 'green' },
		{ value: 'USD', name: 'USD', color: 'blue' }
	];

	const iva = [
		{ value: '16', name: '16%' },
		{ value: '8', name: '8%' }
	];

	const total: string = $derived(
		(
			products?.reduce((acc, curr) => acc + Number(curr.total), 0) *
			(1 + Number(formData.iva || 0) / 100)
		).toFixed(4)
	);

	const subtotal: string = $derived(
		(products?.reduce((acc, curr) => acc + Number(curr.total), 0) * 1).toFixed(4)
	);
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid min-h-[90%] grid-rows-[auto_1fr] md:max-w-[90dvw]">
		<DialogHeader title={selectedDevice.id ? `Editar orden` : 'Registrar orden'} />

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
						<Select
							items={$basicData?.data?.suppliers}
							bind:value={formData.supplierId}
							onValueChange={() => {
								refetch(['po-products']);
							}}
						/>
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
													row.total = (row.quantity * row.price).toFixed(4);
												}}
												type="number"
												min={0}
												class="w-24 rounded-none border-none"
											/>
										</TableCell>

										<TableCell>{row.total}</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				<div class="grid grid-cols-4 gap-4">
					<Label name="Moneda">
						<Select items={currencies} bind:value={formData.currency} placeholder="Moneda" />
					</Label>
					<Label name="Iva">
						<Select items={iva} bind:value={formData.iva} placeholder="Iva" />
					</Label>
					<Label name="SubTotal">
						<Input value={subtotal} type="text" readonly />
					</Label>
					<Label name="Total">
						<Input value={total} type="text" readonly />
					</Label>
					<Label name="Comentarios" class="col-span-4 resize-none">
						<Textarea bind:value={formData.comments} />
					</Label>
				</div>
			</div>
			<Card class="flex w-full max-w-full flex-col overflow-hidden shadow-none">
				<CardHeader class="flex flex-row gap-2 space-y-0 border-b p-2">
					<Input
						bind:value={search}
						placeholder="Buscar..."
						oninput={() => {
							refetch(['po-products']);
						}}
					/>

					<Button
						variant="outline"
						class={cn(
							'h-8',
							filter && 'bg-foreground text-background hover:bg-foreground hover:text-background'
						)}
						onclick={() => {
							filter = !filter;
							refetch(['po-products']);
						}}
					>
						<Filter class="size-3.5" />
						Filtrar
					</Button>
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
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
