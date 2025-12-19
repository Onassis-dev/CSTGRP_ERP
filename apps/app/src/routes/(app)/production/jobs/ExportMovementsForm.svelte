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
	import { Trash, Upload } from 'lucide-svelte';
	import { refetch } from '$lib/utils/query';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { untrack } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { getAreas, getClients, getOptions, getProducts } from '$lib/utils/queries';
	import { cn } from '$lib/utils';

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
		transaction: 'insert' | 'delete';
	}

	interface operation {
		code: string;
		minutes: number;
		area: string;
		transaction: 'insert' | 'delete';
	}

	interface destination {
		amount: string;
		date: string;
		so: string;
		po: string;
		transaction: 'insert' | 'delete';
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
	let destinations: destination[] = $state([]);
	let bastones: string[] = $state([]);
	let formData: any = $state({});
	let files: any = $state();

	async function handleSubmit() {
		const body = {
			...formData,
			destinations,
			operations,
			materials,
			bastones
		};
		if (selectedMovement.id) await api.put('/jobs', body);
		else await api.post('/jobs', body);

		refetch(['jobs']);
		show = false;
		showSuccess(selectedMovement.id ? 'Salida actualizada' : `Salida Registrada`);
	}

	async function processPDF() {
		const form = new FormData();
		form.append('file', files[0]);

		let result;
		const fileEntry = form.get('file');
		const fileName = fileEntry instanceof File ? fileEntry.name : '';

		if (fileName?.includes('.pdf'))
			result = (await api.post('/inventoryvarious/jobpdf', form)).data;
		if (fileName?.includes('.xlsx'))
			result = (await api.post('/inventoryvarious/exportxlsx', form)).data;
		if (!result) showError(null, 'Archivo invalido');

		formData = { ...result };
		materials = result.materials;
		operations =
			result.operations?.map((op: any) => ({ ...op, transaction: op.transaction || 'insert' })) ||
			[];
		destinations = result.destinations;
		bastones = result.bastones;
	}

	function addMaterial() {
		materials.push({
			code: '',
			measurement: '',
			amount: '',
			active: false,
			realAmount: '',
			transaction: 'insert'
		});
		materials = materials;
	}
	function deleteMaterial(i: number) {
		if (materials[i].transaction === 'insert') {
			materials.splice(i, 1);
			materials = materials;
		} else {
			materials[i].transaction = 'delete';
		}
	}

	function addOperation() {
		operations.push({ code: '', minutes: 0, area: '', transaction: 'insert' });
		operations = [...operations];
	}
	function deleteOperation(i: number) {
		if (operations[i].transaction === 'insert') {
			operations.splice(i, 1);
			operations = [...operations];
		} else {
			operations[i].transaction = 'delete';
			operations = [...operations];
		}
	}

	function addDestination() {
		destinations.push({ so: '', po: '', amount: '', date: '', transaction: 'insert' });
		destinations = [...destinations];
	}
	function deleteDestination(i: number) {
		if (destinations[i].transaction === 'insert') {
			destinations.splice(i, 1);
			destinations = [...destinations];
		} else {
			destinations[i].transaction = 'delete';
		}
	}
	function addBaston() {
		bastones.push('');
		bastones = [...bastones];
	}
	function deleteBaston(i: number) {
		bastones.splice(i, 1);
		bastones = [...bastones];
	}

	function cleanData() {
		materials = [
			{
				code: '',
				measurement: '',
				amount: '',
				active: false,
				realAmount: '',
				transaction: 'insert'
			}
		];
		operations = [];
		formData = {};
		files = null;
		inputDisabled = false;
	}

	async function getData() {
		const { data } = await api.get('/jobs/' + selectedMovement.id);
		materials = data.materials;
		destinations = data.destinations || [];
		operations = data.operations || [];
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
					if (operation.area === 'corte' && operation.transaction !== 'delete')
						acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.cortesVariosTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'cortesVarios' && operation.transaction !== 'delete')
						acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.produccionTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'produccion' && operation.transaction !== 'delete')
						acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.calidadTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'calidad' && operation.transaction !== 'delete')
						acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
			formData.serigrafiaTime = operations
				.reduce((acc, operation) => {
					if (operation.area === 'serigrafia' && operation.transaction !== 'delete')
						acc += Number(operation.minutes);
					return acc;
				}, 0)
				.toFixed(2);
		});
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[99%] sm:max-w-5xl">
		<DialogHeader title={selectedMovement.id ? 'Actualizar job-po' : 'Registrar job-po'} />
		<DialogBody class="flex flex-col gap-4 overflow-scroll">
			<div class="grid w-full gap-2 sm:grid-cols-5">
				<Label name="Programación">
					<Input bind:value={formData.programation} />
				</Label>
				<Label name="Job o PO">
					<Input disabled={inputDisabled} bind:value={formData.ref} />
				</Label>
				<Label name="Fecha">
					<Input type="date" bind:value={formData.due} />
				</Label>
				<div class="flex items-end gap-2">
					<Label name="Cantidad">
						<Input bind:value={formData.amount} />
					</Label>
					<Label name="Pz/Caja">
						<Input bind:value={formData.perBox} />
					</Label>
				</div>
				<div class="flex items-end gap-2">
					<Label name="Cliente" class="w-full">
						<Select items={clients} bind:value={formData.clientId} placeholder="" />
					</Label>
					<label>
						<FileInput type="file" bind:files class="hidden" disabled={!!selectedMovement.id} />
						<div
							class={cn(
								'border-input mt-auto flex size-8 cursor-pointer items-center justify-center rounded-sm border',
								selectedMovement.id ? 'opacity-50' : ''
							)}
						>
							<Upload class="size-4" />
						</div>
					</label>
				</div>

				<Label name="Parte">
					<Input bind:value={formData.part} disabled={!!formData.productId} />
				</Label>
				<Label name="Descripción" class="col-span-2">
					<Input bind:value={formData.description} />
				</Label>

				<Label name="Area">
					<Select items={areasList} bind:value={formData.areaId} placeholder="" />
				</Label>

				<Label name="Producto">
					<Select
						items={products}
						bind:value={formData.productId}
						disabled={!!selectedMovement.id}
						allowDeselect
						placeholder=""
					/>
				</Label>

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
				<TabsList class="grid w-full grid-cols-4">
					<TabsTrigger value="materials">Materiales</TabsTrigger>
					<TabsTrigger value="operations">Operaciones</TabsTrigger>
					<TabsTrigger value="detinations">Destinos</TabsTrigger>
					<TabsTrigger value="bastones">Bastones</TabsTrigger>
				</TabsList>

				<TabsContent value="materials" class="mt-4">
					<Table divClass="h-auto overflow-visible">
						<TableHeader class="-top-[calc(1rem-1px)]">
							<TableHead class="w-1 p-0"></TableHead>
							<TableHead>Codigo</TableHead>
							<TableHead>Cantidad</TableHead>
							<TableHead>Real</TableHead>
							<TableHead>Medida</TableHead>
							<TableHead class="w-1">Surtido</TableHead>
							<TableHead class="w-1 p-0"></TableHead>
						</TableHeader>

						<TableBody>
							{#each materials as _, i}
								<TableRow>
									<TableCell
										class={cn(
											'w-1 border-l px-[1px]',
											materials[i].transaction === 'delete' ? 'bg-red-600' : '',
											materials[i].transaction === 'insert' ? 'bg-green-600' : ''
										)}
									/>
									<TableCell class=" p-0 px-[1px]"
										><MaterialInput
											bind:value={materials[i].code}
											bind:measurement={materials[i].measurement}
											disabled={materials[i].transaction === 'delete'}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none "
											type="text"
											bind:value={materials[i].amount}
											disabled={materials[i].transaction === 'delete'}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none "
											type="text"
											bind:value={materials[i].realAmount}
											disabled={materials[i].transaction === 'delete'}
										/></TableCell
									>
									<TableCell class="w-5">{materials[i].measurement}</TableCell>
									<TableCell class="w-1 p-0 text-center"
										><Checkbox
											class="mx-auto"
											bind:checked={materials[i].active}
											disabled={materials[i].transaction === 'delete'}
										/></TableCell
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
				<TabsContent value="operations">
					<Table divClass="h-auto overflow-visible mt-4">
						<TableHeader class="border-t">
							<TableHead class="w-1 p-0"></TableHead>
							<TableHead>Codigo</TableHead>
							<TableHead>Minutos</TableHead>
							<TableHead>Area</TableHead>
							<TableHead class="w-1 p-0"></TableHead>
						</TableHeader>

						<TableBody>
							{#each operations as operation, i}
								<TableRow>
									<TableCell
										class={cn(
											'w-1 border-l px-[1px]',
											operations[i].transaction === 'delete' ? 'bg-red-600' : '',
											operations[i].transaction === 'insert' ? 'bg-green-600' : ''
										)}
									/>
									<TableCell class="border-l p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={operation.code}
											disabled={operations[i].transaction === 'delete'}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={operation.minutes}
											oninput={() => (operations = [...operations])}
											disabled={operations[i].transaction === 'delete'}
										/></TableCell
									>
									<TableCell class="w-32 p-0 px-[1px]"
										><Select
											class="rounded-none border-none"
											placeholder="Area"
											items={areas}
											bind:value={operation.area}
											onValueChange={() => (operations = [...operations])}
											disabled={operations[i].transaction === 'delete'}
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

				<TabsContent value="detinations">
					<Table divClass="h-auto overflow-visible mt-4">
						<TableHeader class="border-t">
							<TableHead class="w-1 p-0"></TableHead>
							<TableHead>SO</TableHead>
							<TableHead>PO</TableHead>
							<TableHead>Pz</TableHead>
							<TableHead>Fecha</TableHead>
							<TableHead class="w-1 p-0"></TableHead>
						</TableHeader>

						<TableBody>
							{#each destinations as destination, i}
								<TableRow>
									<TableCell
										class={cn(
											'w-1 border-l px-[1px]',
											destinations[i].transaction === 'delete' ? 'bg-red-600' : '',
											destinations[i].transaction === 'insert' ? 'bg-green-600' : ''
										)}
									/>
									<TableCell class="border-l p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={destination.so}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={destination.po}
											oninput={() => (destinations = [...destinations])}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="text"
											bind:value={destination.amount}
											oninput={() => (destinations = [...destinations])}
										/></TableCell
									>
									<TableCell class="p-0 px-[1px]"
										><Input
											class="rounded-none border-none !opacity-100"
											type="date"
											bind:value={destination.date}
											oninput={() => (destinations = [...destinations])}
										/></TableCell
									>
									<TableCell class="flex h-8 justify-center p-0 px-[1px]"
										><Button
											onclick={() => deleteDestination(i)}
											variant="ghost"
											class="text-destructive-foreground aspect-square p-1"
											><Trash class="size-5" /></Button
										></TableCell
									>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
					<Button onclick={addDestination} class="mx-auto">Agregar destino</Button>
				</TabsContent>
				<TabsContent value="bastones">
					<Table divClass="h-auto overflow-visible mt-4">
						<TableHeader class="border-t">
							<TableHead>Medida</TableHead>
							<TableHead class="w-1 p-0"></TableHead>
						</TableHeader>

						<TableBody>
							{#each bastones as _, i}
								<TableRow>
									<TableCell class="border-l p-0 px-[1px]"
										><Input
											class=" rounded-none border-none !opacity-100"
											type="text"
											bind:value={bastones[i]}
										/></TableCell
									>

									<TableCell class="flex h-8  justify-center p-0 px-[1px]"
										><Button
											onclick={() => deleteBaston(i)}
											variant="ghost"
											class="text-destructive-foreground aspect-square p-1"
											><Trash class="size-5" /></Button
										></TableCell
									>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
					<Button onclick={addBaston} class="mx-auto">Agregar baston</Button>
				</TabsContent>
			</Tabs>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
