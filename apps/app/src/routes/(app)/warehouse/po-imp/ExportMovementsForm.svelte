<script lang="ts">
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
	import Separator from '$lib/components/ui/separator/separator.svelte';

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

	let materials: material[] = $state([]);
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
		}
		if (fileName?.includes('.xlsx')) {
			result = (await api.post('/inventoryvarious/exportxlsx', form)).data;
			formData = { ...result };
			materials = result.materials;
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
	function cleanData() {
		materials = [{ code: '', measurement: '', amount: '', active: false, realAmount: '' }];
		formData = {};
		files = null;
		inputDisabled = false;
	}

	async function getData() {
		const { data } = await api.get('/po-imp/' + selectedMovement.id);
		materials = data.materials;
		formData = {
			id: data.id,
			jobpo: data.jobpo,
			programation: data.programation,
			due: data.due,
			corteTime: data.corte,
			cortesVariosTime: data.cortesVarios,
			produccionTime: data.produccion,
			calidadTime: data.calidad,
			serigrafiaTime: data.serigrafia,
			part: data.part,
			amount: data.amount
		};
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
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[90%] sm:max-w-4xl">
		<DialogHeader title={selectedMovement.id ? 'Actualizar job-po' : 'Registrar job-po'} />
		<DialogBody class="flex flex-col gap-4">
			<div class="grid w-full gap-4 sm:grid-cols-3">
				<Label name="Programación">
					<Input bind:value={formData.programation} />
				</Label>
				<Label name="Job o PO">
					<Input disabled={inputDisabled} bind:value={formData.jobpo} />
				</Label>
				<Label name="Parte">
					<Input bind:value={formData.part} />
				</Label>
				<Label name="Fecha">
					<Input type="date" bind:value={formData.due} />
				</Label>
				<Label name="Cantidad">
					<Input bind:value={formData.amount} />
				</Label>
				<Label name="Archivo">
					<FileInput type="file" bind:files />
				</Label>
			</div>

			<Separator />

			<div class="grid w-full gap-4 sm:grid-cols-3">
				<Label name="Corte">
					<Input bind:value={formData.corteTime} />
				</Label>
				<Label name="Cortes varios">
					<Input bind:value={formData.cortesVariosTime} />
				</Label>
				<Label name="Produccion">
					<Input bind:value={formData.produccionTime} />
				</Label>
				<Label name="Calidad">
					<Input bind:value={formData.calidadTime} />
				</Label>
				<Label name="Serigrafia">
					<Input bind:value={formData.serigrafiaTime} />
				</Label>
			</div>

			<Separator />

			<Table divClass="h-auto overflow-visible">
				<TableHeader class="border-t">
					<TableHead class="border-l">Codigo</TableHead>
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
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
