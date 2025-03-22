<script lang="ts">
	import { run } from 'svelte/legacy';

	import MaterialInput from '$lib/components/basic/MaterialInput.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { FileInput, Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { Trash } from 'lucide-svelte';

	interface Props {
		show: boolean;
		reload: any;
		selectedMovement?: any;
	}

	let { show = $bindable(), reload, selectedMovement = {} }: Props = $props();
	interface material {
		code: string;
		amount: string;
		measurement: string;
	}

	let materials: material[] = $state([]);
	let formData: any = $state({});
	let files: any = $state();

	async function handleSubmit() {
		if (selectedMovement.id) {
			await api.put('/po-imp/import', {
				...formData,
				materials
			});
		} else {
			await api.post('/po-imp/import', {
				...formData,
				materials
			});
		}

		reload();

		show = false;
		showSuccess(selectedMovement.id ? 'Importacion actualizada' : `Importacion Registrada`);
	}

	async function processPDF() {
		const form = new FormData();
		form.append('file', files[0]);

		const result = (await api.post('/inventoryvarious/importpdf', form)).data;
		formData.import = result.importNum;
		formData.due = result.dueDate;
		materials = result.materials;
	}

	function addMaterial() {
		materials.push({ code: '', measurement: '', amount: '' });
		materials = materials;
	}
	function deleteMaterial(i: number) {
		materials.splice(i, 1);
		materials = materials;
	}

	function cleanData() {
		materials = [{ code: '', measurement: '', amount: '' }];
		formData = {};
		files = null;
		inputDisabled = false;
	}

	async function getData() {
		cleanData();
		const { data } = await api.get('/po-imp/' + selectedMovement.id);
		materials = data.materials;
		formData = { id: data.id, import: data.import, location: data.location, due: data.due };
		files = null;
		inputDisabled = false;
	}

	let options = [
		{ value: 'At M&M, In transit', name: 'En transito' },
		{ value: 'At CST, In revision', name: 'En revisión' },
		{ value: 'At CST, Qtys verified', name: 'Listo' }
	];
	let inputDisabled;
	run(() => {
		inputDisabled = !!files;
	});
	run(() => {
		if (files) processPDF();
	});
	run(() => {
		if (!show || show) cleanData();
	});
	run(() => {
		if (selectedMovement.id) getData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="max-w-3xl">
		<DialogHeader>
			<DialogTitle
				>{selectedMovement.id ? 'Actualizar importacion' : 'Registrar importacion'}</DialogTitle
			>
		</DialogHeader>
		<DialogBody>
			<div class="grid w-full grid-cols-3 gap-4">
				<div class="space-y-2">
					<span>Importacion</span>
					<Input disabled={inputDisabled} name="text" bind:value={formData.import} />
				</div>
				<div class="space-y-2">
					<span>Ubicacion</span>
					<Select items={options} bind:value={formData.location} />
				</div>
				<div class="space-y-2">
					<span>Fecha</span>
					<Input type="date" bind:value={formData.due} />
				</div>
				<div class=" col-span-3 space-y-2">
					<span>Archivo</span>
					<FileInput type="file" bind:files />
				</div>
			</div>

			<Table class="mt-4">
				<TableHeader class="border-t">
					<TableHead class="border-l">Codigo</TableHead>
					<TableHead>Cantidad</TableHead>
					<TableHead>Medida</TableHead>
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
									class="rounded-none border-none"
									type="text"
									bind:value={materials[i].amount}
								/></TableCell
							>
							<TableCell class="w-5">{materials[i].measurement}</TableCell>
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
					<TableRow>
						<TableCell class="border-l" colspan={4}
							><Button onclick={addMaterial} class="w-full max-w-40" color="light"
								>Anadir material</Button
							></TableCell
						>
					</TableRow>
				</TableBody>
			</Table>

			<Button onclick={handleSubmit} type="submit" class="mt-4 w-full">Guardar cambios</Button>
		</DialogBody>
	</DialogContent>
</Dialog>
