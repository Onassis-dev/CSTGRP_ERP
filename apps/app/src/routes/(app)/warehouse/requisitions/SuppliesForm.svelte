<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
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
	import { Input } from '$lib/components/ui/input';
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
	import { onMount, untrack } from 'svelte';
	import Cookies from 'js-cookie';
	interface Props {
		show: boolean;
	}

	let { show = $bindable() }: Props = $props();
	let formData: any = $state({
		petitioner: Cookies.get('username')
	});
	let areas: any[] = $state();
	interface material {
		code: string;
		amount: string;
		measurement: string;
	}

	let materials: material[] = $state([]);

	async function handleSubmit() {
		await api.post('/requisitions/supplies', {
			...formData,
			materials
		});

		show = false;
		showSuccess(`Requisicion Registrada`);
	}

	async function fetchOptions() {
		areas = (await api.get('/hrvarious/areas')).data;
	}

	const motives = [
		{ name: 'Producción', value: 'Producción' },
		{ name: 'Empaque', value: 'Empaque' },
		{ name: 'Corte de tela', value: 'Corte de tela' },
		{ name: 'Cortes varios', value: 'Cortes varios' }
	];

	function addMaterial() {
		materials.push({ code: '', measurement: '', amount: '' });
		materials = materials;
	}
	function deleteMaterial(i: number) {
		materials.splice(i, 1);
		materials = materials;
	}

	onMount(() => {
		fetchOptions();
	});

	$effect(() => {
		show;
		materials = [{ code: '', measurement: '', amount: '' }];
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="max-w-3xl">
		<DialogHeader>
			<DialogTitle>Pedir insumos</DialogTitle>
		</DialogHeader>
		<DialogBody>
			<div class="mb-4 grid w-full grid-cols-3 gap-4">
				<Label name="Solicitante:">
					<Input bind:value={formData.petitioner} />
				</Label>
				<Label name="Motivo:">
					<Select items={motives} bind:value={formData.motive} />
				</Label>
				<Label name="Area:">
					<Select items={areas} bind:value={formData.areaId} />
				</Label>
				<Label name="Job:" class="col-span-3">
					<Input bind:value={formData.job} />
				</Label>
			</div>

			<Table>
				<TableHeader class="border-t">
					<TableHead class="border-l">Codigo</TableHead>
					<TableHead>Cantidad</TableHead>
					<TableHead>Medida</TableHead>
					<TableHead class="w-1 p-0"></TableHead>
				</TableHeader>

				<TableBody>
					{#each materials as _, i}
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
