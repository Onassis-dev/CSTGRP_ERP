<script lang="ts">
	import MaterialInput from '$lib/components/basic/MaterialInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
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
	import { refetch } from '$lib/utils/query';
	import Label from '$lib/components/basic/Label.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';

	interface Props {
		show: boolean;
		selectedMovement?: any;
	}

	let { show = $bindable(), selectedMovement = {} }: Props = $props();
	interface material {
		code: string;
		amount: string;
		measurement: string;
		active: boolean;
		activeDate?: string | null;
	}

	let materials: material[] = $state([]);
	let formData: any = $state({});
	let files: any = $state();

	async function handleSubmit() {
		if (selectedMovement.id) {
			await api.put('/ie/imports/import', {
				...formData,
				materials
			});
		} else {
			await api.post('/ie/imports/import', {
				...formData,
				materials
			});
		}

		refetch(['imports']);

		show = false;
		showSuccess(selectedMovement.id ? 'Importacion actualizada' : `Importacion Registrada`);
	}

	async function processPDF() {
		const form = new FormData();
		form.append('file', files[0]);

		const result = (await api.post('/inventoryvarious/importpdf', form)).data;
		formData.ref = result.ref;
		formData.due = result.dueDate;
		materials = result.materials;
	}

	function addMaterial() {
		materials.push({ code: '', measurement: '', amount: '', active: false });
		materials = materials;
	}
	function deleteMaterial(i: number) {
		materials.splice(i, 1);
		materials = materials;
	}

	function cleanData() {
		materials = [{ code: '', measurement: '', amount: '', active: false }];
		formData = {};
		files = null;
		inputDisabled = false;
	}

	async function getData() {
		cleanData();
		const { data } = await api.get('/ie/imports/' + selectedMovement.id);
		materials = data.materials;
		formData = { id: data.id, ref: data.ref, due: data.due };
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
		if (!show || show) cleanData();
	});
	$effect(() => {
		if (selectedMovement.id) getData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[90%] sm:max-w-3xl">
		<DialogHeader
			title={selectedMovement.id ? 'Actualizar importacion' : 'Registrar importacion'}
		/>
		<DialogBody>
			<div class="grid w-full gap-4 sm:grid-cols-3">
				<Label name="Importacion">
					<Input disabled={inputDisabled} name="text" bind:value={formData.ref} />
				</Label>
				<Label name="Fecha">
					<Input type="date" bind:value={formData.due} />
				</Label>
				<Label name="Archivo">
					<FileInput type="file" bind:files />
				</Label>
			</div>

			<Table class="mt-4">
				<TableHeader class="border-t">
					<TableHead class="border-l"></TableHead>
					<TableHead>Codigo</TableHead>
					<TableHead>Cantidad</TableHead>
					<TableHead>Medida</TableHead>
					<TableHead class="w-1 p-0"></TableHead>
				</TableHeader>

				<TableBody>
					{#each materials as material, i}
						<TableRow>
							<TableCell class="w-1 border-l p-0 text-center"
								><Checkbox class="mx-auto" bind:checked={materials[i].active} /></TableCell
							>
							<TableCell class="p-0 px-[1px]"
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
									class="aspect-square p-1 text-destructive-foreground"
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
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
