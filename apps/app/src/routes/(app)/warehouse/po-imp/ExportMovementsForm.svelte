<script lang="ts">
	import { run } from 'svelte/legacy';

	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
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

	interface Props {
		show: boolean;
		reload: any;
		selectedMovement?: any;
	}

	let { show = $bindable(), reload, selectedMovement = {} }: Props = $props();

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

		reload();
		show = false;
		showSuccess(selectedMovement.id ? 'Salida actualizada' : `Salida Registrada`);
	}

	async function processPDF() {
		const form = new FormData();
		form.append('file', files[0]);

		let result;
		const fileName = form.get('file')?.name;
		if (fileName?.includes('.pdf')) {
			result = (await api.post('/inventoryvarious/jobpdf', form)).data;
			console.log(result);
			formData.jobpo = result.jobpo;
			formData.due = result.dueDate;

			materials = result.materials;
		}
		if (fileName?.includes('.xlsx')) {
			result = (await api.post('/inventoryvarious/exportxlsx', form)).data;
			formData.jobpo = result.jobpo;
			formData.due = result.dueDate;
			materials = result.materials;
			console.log(result);
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
		formData = { id: data.id, jobpo: data.jobpo, programation: data.programation, due: data.due };
		files = null;
		inputDisabled = false;
	}
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
	<DialogContent class="max-w-3xl ">
		<DialogHeader>
			<DialogTitle>{selectedMovement.id ? 'Actualizar job-po' : 'Registrar job-po'}</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-[85lvh]">
			<div class="grid w-full grid-cols-3 gap-4">
				<div class="space-y-2">
					<span>Programacion</span>
					<Input name="text" bind:value={formData.programation} />
				</div>
				<div class="space-y-2">
					<span>Job o PO</span>
					<Input disabled={inputDisabled} name="text" bind:value={formData.jobpo} />
				</div>
				<div class="space-y-2">
					<span>Fecha</span>
					<Input type="date" bind:value={formData.due} />
				</div>
				<div class="col-span-3 space-y-2">
					<span>Archivo</span>
					<FileInput type="file" bind:files />
				</div>
			</div>

			<Table class="mt-4">
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
								><Checkbox class="mx-auto size-5" bind:checked={materials[i].active} /></TableCell
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
					<TableRow>
						<TableCell class="border-l" colspan={6}
							><Button onclick={addMaterial} class="w-full max-w-40">Anadir material</Button
							></TableCell
						>
					</TableRow>
				</TableBody>
			</Table>

			<Button onclick={handleSubmit} type="submit" class="mt-4 w-full">Guardar cambios</Button>
		</DialogBody>
	</DialogContent>
</Dialog>
