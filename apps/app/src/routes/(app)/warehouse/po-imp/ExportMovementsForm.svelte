<script lang="ts">
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { FileInput, Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showError, showSuccess } from '$lib/utils/showToast';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import MaterialInput from '$lib/components/basic/MaterialInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Trash } from 'lucide-svelte';
	import { refetch } from '$lib/utils/query';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { untrack } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { getAreas, getClients, getOptions, getProducts } from '$lib/utils/queries';

	interface Props {
		show: boolean;
		selectedMovement?: any;
	}

	let { show = $bindable(), selectedMovement = {} }: Props = $props();

	interface material {
		code: string;
		amount: string;
		realAmount: string;
		measurement: string;
		active: boolean;
	}

	interface operation {
		code: string;
		minutes: number;
		area: string;
	}

	const clientsQuery = createQuery({
		queryKey: ['inventory-clients'],
		queryFn: getClients
	});
	const clients = $derived(getOptions($clientsQuery?.data));

	const areasQuery = createQuery({
		queryKey: ['inventory-areas'],
		queryFn: getAreas
	});
	const areasList = $derived(getOptions($areasQuery?.data));

	const productsQuery = createQuery({
		queryKey: ['inventory-products'],
		queryFn: getProducts
	});
	const products = $derived(getOptions($productsQuery?.data));

	const areas = [
		{ name: 'Corte', value: 'corte' },
		{ name: 'Cortes varios', value: 'cortesVarios' },
		{ name: 'Produccion', value: 'produccion' },
		{ name: 'Calidad', value: 'calidad' },
		{ name: 'Serigrafia', value: 'serigrafia' }
	];

	let materials: material[] = $state([]);
	let operations: operation[] = $state([]);
	let formData: any = $state({});
	let files: any = $state();

	async function handleSubmit() {
		if (selectedMovement.id) {
			await api.put('/po-imp/export', {
				...formData,
				materials
			});
		} else {
			await api.post('/po-imp/export', {
				...formData,
				materials
			});
		}

		refetch(['po-imp']);
		show = false;
		showSuccess(selectedMovement.id ? 'Salida actualizada' : `Salida Registrada`);
	}

	async function processPDF() {
		const form = new FormData();
		form.append('file', files[0]);

		let result;
		const fileEntry = form.get('file');
		const fileName = fileEntry instanceof File ? fileEntry.name : '';
		if (fileName?.includes('.pdf')) {
			result = (await api.post('/inventoryvarious/jobpdf', form)).data;
			formData = { ...result };
			materials = result.materials;
			operations = result.operations;
		}
		if (fileName?.includes('.xlsx')) {
			result = (await api.post('/inventoryvarious/exportxlsx', form)).data;
			formData = { ...result };
			materials = result.materials;
			operations = result.operations;
		}
		if (!result) showError(null, 'Archivo invalido');
	}

	function addMaterial() {
		materials.push({ code: '', measurement: '', amount: '', active: false, realAmount: '' });
		materials = materials;
	}
	function deleteMaterial(i: number) {
		materials.splice(i, 1);
		materials = materials;
	}

	function addOperation() {
		operations.push({ code: '', minutes: 0, area: '' });
		operations = [...operations];
	}
	function deleteOperation(i: number) {
		operations.splice(i, 1);
		operations = [...operations];
	}

	function cleanData() {
		materials = [{ code: '', measurement: '', amount: '', active: false, realAmount: '' }];
		operations = [];
		formData = {};
		files = null;
		inputDisabled = false;
	}

	async function getData() {
		const { data } = await api.get('/po-imp/' + selectedMovement.id);
		materials = data.materials;
		formData = { ...data };
		files = null;
		inputDisabled = false;
	}

	let inputDisabled = $state(false);
	$effect(() => {
		inputDisabled = !!files;
	});
	$effect(() => {
		if (files) processPDF();
	});
	$effect(() => {
		show;
		cleanData();
	});
	$effect(() => {
		if (selectedMovement.id) getData();
	});

	$effect(() => {
		operations;
		untrack(() => {
			if (!operations?.length) return;
			formData.corteTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'corte') acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.cortesVariosTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'cortesVarios') acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.produccionTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'produccion') acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.calidadTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'calidad') acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.serigrafiaTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'serigrafia') acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
		});
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[95%] sm:max-w-5xl">
		<DialogHeader title={selectedMovement.id ? 'Actualizar job-po' : 'Registrar job-po'} />
		<DialogBody class="flex flex-col gap-4">
			<div class="grid w-full gap-4 sm:grid-cols-4">
				<Label name="Archivo">
					<FileInput type="file" bind:files />
				</Label>
				<Label name="Programación">
					<Input bind:value={formData.programation} />
				</Label>
				<Label name="Parte">
					<Input bind:value={formData.part} disabled={!!formData.productId} />
				</Label>
				<Label name="Cliente">
					<Select items={clients} bind:value={formData.clientId} />
				</Label>
			</div>
			<div class="grid w-full gap-4 sm:grid-cols-5">
				<Label name="Job o PO">
					<Input disabled={inputDisabled} bind:value={formData.jobpo} />
				</Label>
				<Label name="Cantidad">
					<Input bind:value={formData.amount} />
				</Label>
				<Label name="Fecha">
					<Input type="date" bind:value={formData.due} />
				</Label>
				<Label name="Area">
					<Select items={areasList} bind:value={formData.areaId} />
				</Label>
				<Label name="Producto">
					<Select
						items={products}
						bind:value={formData.productId}
						disabled={!!selectedMovement.id}
						allowDeselect
					/>
				</Label>
			</div>

			<div class="grid w-full gap-4 sm:grid-cols-5">
				<Label name="Corte">
					<Input bind:value={formData.corteTime} disabled={!!operations?.length} />
				</Label>
				<Label name="Serigrafia">
					<Input bind:value={formData.serigrafiaTime} disabled={!!operations?.length} />
				</Label>
				<Label name="Cortes varios">
					<Input bind:value={formData.cortesVariosTime} disabled={!!operations?.length} />
				</Label>
				<Label name="Produccion">
					<Input bind:value={formData.produccionTime} disabled={!!operations?.length} />
				</Label>
				<Label name="Calidad">
					<Input bind:value={formData.calidadTime} disabled={!!operations?.length} />
				</Label>
			</div>

			<Tabs class="w-full" value="materials">
				<TabsList class="grid w-full grid-cols-2">
					<TabsTrigger value="materials">Materiales</TabsTrigger>
					<TabsTrigger value="movements">Movimientos</TabsTrigger>
				</TabsList>

				<TabsContent value="materials" class="mt-4">
					<Table divClass="h-auto overflow-visible">
						<TableHeader class="border-t">
							<TableHead>Codigo</TableHead>
							<TableHead>Cantidad</TableHead>
							<TableHead>Real</TableHead>
							<TableHead>Medida</TableHead>
							<TableHead class="w-1">Surtido</TableHead>
							<TableHead class="w-1 p-0"></TableHead>
						</TableHeader>

						<TableBody>
							{#each materials as material, i}
								<TableRow>
									<TableCell class="border-l p-0 px-[1px]"
										><MaterialInput
											bind:value={materials[i].code}
											bind:measurement={materials[i].measurement}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={materials[i].amount}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={materials[i].realAmount}
										/></TableCell
									>
									<TableCell class="w-5">{materials[i].measurement}</TableCell>
									<TableCell class="w-1 p-0 text-center"
										><Checkbox class="mx-auto" bind:checked={materials[i].active} /></TableCell
									>
									<TableCell class="flex h-8 justify-center p-0 px-[1px]"
										><Button
											onclick={() => deleteMaterial(i)}
											variant="ghost"
											class="text-destructive-foreground aspect-square p-1"
											><Trash class="size-5" /></Button
										></TableCell
									>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
					<Button onclick={addMaterial} class="mx-auto">Agregar material</Button>
				</TabsContent>
				<TabsContent value="movements">
					<Table divClass="h-auto overflow-visible mt-4">
						<TableHeader class="border-t">
							<TableHead>Codigo</TableHead>
							<TableHead>Minutos</TableHead>
							<TableHead>Area</TableHead>
							<TableHead class="w-1 p-0"></TableHead>
						</TableHeader>

						<TableBody>
							{#each operations as operation, i}
								<TableRow>
									<TableCell class="border-l p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={operation.code}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={operation.minutes}
											oninput={() => (operations = [...operations])}
										/></TableCell
									>
									<TableCell class="w-32 p-0 px-[1px]"
										><Select
											class="rounded-none border-none"
											placeholder="Area"
											items={areas}
											bind:value={operation.area}
											onValueChange={() => (operations = [...operations])}
										/></TableCell
									>
									<TableCell class="flex h-8 justify-center p-0 px-[1px]"
										><Button
											onclick={() => deleteOperation(i)}
											variant="ghost"
											class="text-destructive-foreground aspect-square p-1"
											><Trash class="size-5" /></Button
										></TableCell
									>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
					<Button onclick={addOperation} class="mx-auto">Agregar operacion</Button>
				</TabsContent>
			</Tabs>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
