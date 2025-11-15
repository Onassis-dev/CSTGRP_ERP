<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import Label from '$lib/components/basic/Label.svelte';
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
	import Button from '$lib/components/ui/button/button.svelte';
	import { Trash } from 'lucide-svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		show?: boolean;
		selectedRow: any;
	}

	let { show = $bindable(false), selectedRow = $bindable() }: Props = $props();

	let clients: any[] = $state([]);

	const emptyData = {
		noFactura: '',
		date: '',
		regimen: '',
		pedimento: '',
		exchangeRate: '',
		comments: '',
		exteriorData: [
			{ name: 'DTA', amount: '' },
			{ name: 'PRV', amount: 290 },
			{ name: 'IVA/PRV', amount: 46 },
			{ name: 'IVA', amount: '' },
			{ name: 'IGI', amount: '' }
		],
		mexData: [
			{ name: 'VENTANILLA UNICA', amount: 368.67 },
			{ name: 'VALIDACION ELECTRONICA', amount: 221.2 },
			{ name: 'PREVALIDACION', amount: 21.3 },
			{ name: 'HONORARIOS AGENCIA ADUANAL', amount: 800.0 },
			{ name: 'HOJA ADICIONAL', amount: 300.0 },
			{ name: 'GASTOS COMPLEMENTARIOS', amount: '' },
			{ name: 'DIGITALIZACION', amount: '' }
		],
		usData: [],
		almacenData: [
			{ name: 'REGISTRO POR CAMION', amount: 0, price: '40' },
			{ name: 'REVISION DE MERCANCIAS', amount: 0, price: '10' }
		],
		extraData: [
			{ name: 'SELLO C-TPAT', amount: '' },
			{ name: 'MANIOBRAS', amount: '' },
			{ name: 'FLETE', amount: '' },
			{ name: 'PARADA EXTRA', amount: '' }
		],
		clientsData: [],
		unityOptions: [
			{ name: 'CAJA', inOut: 5, almacenaje: 2.5 },
			{ name: 'PALLET', inOut: 10, almacenaje: 4 },
			{ name: 'PALLET XL', inOut: 12, almacenaje: 4 }
		]
	};

	let formData: any = $state(emptyData);

	let unityOptionsForSelect = $derived(
		formData.unityOptions.map(({ name }: any) => ({ name, value: name }))
	);

	async function handleSubmit() {
		if (selectedRow.id) {
			await api.put('/ie/preforms', formData);
			showSuccess('Proforma actualizada');
		} else {
			await api.post('/ie/preforms', formData);
			showSuccess('Proforma registrada');
		}

		refetch(['preforms']);
		show = false;
	}

	const fetchClients = async () => {
		clients = (await api.get('/inventoryvarious/clients-legal')).data;
	};

	async function fetchData() {
		formData = (await api.get('/ie/preforms/' + selectedRow.id)).data;
	}

	$effect(() => {
		if (selectedRow.id) fetchData();
		else formData = emptyData;
	});

	$effect(() => {
		if (show) fetchClients();
	});

	function addRow() {
		formData.clientsData.push({
			client: '',
			entrada: '',
			bultos: '',
			unidad: '',
			dias: '',
			orden: ''
		});
		formData = formData;
	}

	function deleteRow(i: number) {
		formData.clientsData.splice(i, 1);
		formData = formData;
	}

	const regimens = [
		{ value: 'IN Importación', name: 'Import', color: 'blue' },
		{ value: 'RT Exportación', name: 'Export', color: 'red' }
	];
</script>

<Dialog bind:open={show}>
	<DialogContent class="sm:max-w-6xl">
		<DialogHeader
			title={selectedRow.id ? `Editar ${selectedRow.noFactura}` : 'Registrar Proforma'}
		/>
		<DialogBody>
			<div
				class="border-primary/20 relative mb-6 grid w-full grid-cols-5 gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
					Datos Generales
				</div>
				<Label name="Factura">
					<Input bind:value={formData.noFactura} />
				</Label>
				<Label name="Fecha">
					<Input type="date" bind:value={formData.date} />
				</Label>
				<Label name="Regimen">
					<Select
						items={regimens}
						bind:value={formData.regimen}
						onValueChange={(v) => {
							formData.usData = [];
							if (formData.regimen === 'IN Importación') {
								formData.usData = [{ name: 'SHIPPER AMERICANO', amount: '' }];
							}
							if (formData.regimen === 'RT Exportación') {
								formData.usData = [
									{ name: 'E-MANIFEST', amount: '' },
									{ name: 'DUTY HTS', amount: '' }
								];
							}
						}}
					/>
				</Label>
				<Label name="Pedimento">
					<Input bind:value={formData.pedimento} />
				</Label>
				<Label name="Tipo de cambio">
					<Input bind:value={formData.exchangeRate} />
				</Label>
			</div>

			<div
				class="border-primary/20 relative mb-6 grid w-full grid-cols-5 gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
					GASTOS ADUANALES AL COMERCIO EXTERIOR
				</div>
				{#each formData.exteriorData as item}
					<Label name={item.name}>
						<Input bind:value={item.amount} />
					</Label>
				{/each}
			</div>

			<div
				class="border-primary/20 relative mb-6 grid w-full grid-cols-5 gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
					GASTOS AGENCIA ADUANAL MEX
				</div>
				{#each formData.mexData as item}
					<Label name={item.name}>
						<Input bind:value={item.amount} />
					</Label>
				{/each}
			</div>

			<div
				class="border-primary/20 relative mb-6 grid w-full grid-cols-5 gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
					GASTOS AGENCIA ADUANAL US
				</div>
				{#each formData.usData as item}
					<Label name={item.name}>
						<Input bind:value={item.amount} />
					</Label>
				{/each}
			</div>

			<div
				class="border-primary/20 relative mb-6 grid w-full grid-cols-5 gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
					ENTRADAS DE ALMACEN US
				</div>
				{#each formData.almacenData as item}
					<Label name={item.name} class="flex">
						<Input bind:value={item.amount} />
						<Input bind:value={item.price} />
					</Label>
				{/each}
			</div>

			<div
				class="border-primary/20 relative mb-6 grid w-full grid-cols-5 gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">GASTOS EXTRA</div>

				{#each formData.extraData as item}
					<Label name={item.name}>
						<Input bind:value={item.amount} />
					</Label>
				{/each}
			</div>

			<div class="font-semibold">CLIENTES</div>

			<Table divClass="h-auto overflow-visible">
				<TableHeader class="-top-[calc(1rem-1px)]">
					<TableHead>Cliente</TableHead>
					<TableHead>Entrada</TableHead>
					<TableHead>Bultos</TableHead>
					<TableHead>Unidad</TableHead>
					<TableHead>Dias</TableHead>
					<TableHead>Orden</TableHead>
				</TableHeader>

				<TableBody>
					{#each formData.clientsData as _, i}
						<TableRow>
							<TableCell class="border-l p-0 px-[1px]">
								<Select
									class="rounded-none border-none "
									bind:value={formData.clientsData[i].client}
									items={clients}
									placeholder="Cliente"
								/>
							</TableCell>
							<TableCell class="p-0 px-[1px]"
								><Input
									class="rounded-none border-none "
									type="text"
									bind:value={formData.clientsData[i].entrada}
								/></TableCell
							>
							<TableCell class="p-0 px-[1px]"
								><Input
									class="rounded-none border-none "
									type="text"
									bind:value={formData.clientsData[i].bultos}
								/></TableCell
							>

							<TableCell class="p-0 px-[1px]"
								><Select
									class="rounded-none border-none "
									bind:value={formData.clientsData[i].unidad}
									items={unityOptionsForSelect}
									placeholder="Seleeciona unidad"
								/></TableCell
							>

							<TableCell class="p-0 px-[1px]"
								><Input
									class="rounded-none border-none "
									type="text"
									bind:value={formData.clientsData[i].dias}
								/></TableCell
							>

							<TableCell class="p-0 px-[1px]"
								><Input
									class="rounded-none border-none "
									type="text"
									bind:value={formData.clientsData[i].orden}
								/></TableCell
							>

							<TableCell class="flex h-8 justify-center p-0 px-[1px]"
								><Button
									onclick={() => deleteRow(i)}
									variant="ghost"
									class="text-destructive-foreground aspect-square p-1"
									><Trash class="size-5" /></Button
								></TableCell
							>
						</TableRow>
					{/each}
				</TableBody>
			</Table>

			<Button onclick={addRow} class="mb-6">Agregar Entrada</Button>

			<div
				class="border-primary/20 relative mb-6 grid w-full gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">FIJOS</div>

				<div class="grid grid-cols-[6rem_10rem_10rem] gap-x-2">
					<div></div>
					<div>In/Out</div>
					<div>Almacenaje</div>
					{#each formData.unityOptions as option}
						<p>{option.name}</p>
						<Input bind:value={option.inOut} />
						<Input bind:value={option.almacenaje} />
					{/each}
				</div>
			</div>
			<div
				class="border-primary/20 relative mb-6 grid w-full gap-x-4 gap-y-2 rounded-md border p-4"
			>
				<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">COMENTARIOS</div>

				<Textarea bind:value={formData.comments} />
			</div>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
