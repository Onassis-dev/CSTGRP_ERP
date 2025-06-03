<script lang="ts">
	import ExportMovementsForm from './ExportMovementsForm.svelte';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { formatDate } from '$lib/utils/functions';
	import JobComparisonCard from './JobComparisonCard.svelte';
	import { Pen, Ruler } from 'lucide-svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import ImportMovementsForm from './ImportMovementsForm.svelte';
	import { preventDefault } from 'svelte/legacy';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';

	let show2 = $state(false);
	let show3 = $state(false);
	let show4 = $state(false);
	let show5 = $state(false);

	let filters = $state({
		type: 'both',
		location: '',
		code: ''
	});

	let selectedMovement: any = $state({});

	let options = [
		{ value: 'both', name: 'Ambos' },
		{ value: 'imports', name: 'Importaciones' },
		{ value: 'exports', name: 'Exportaciones' }
	];

	let locations = [
		{ value: 'At M&M, In transit', name: 'En transito' },
		{ value: 'At CST, In revision', name: 'En revisión' },
		{ value: 'At CST, Qtys verified', name: 'Listo' }
	];

	const movementsQuery = createQuery({
		queryKey: ['po-imp', { ...filters }],
		queryFn: async () => (await api.get('/po-imp', { params: filters })).data
	});

	let movements = $derived(
		$movementsQuery?.data?.map((e: any) => {
			return { ...e, realAmount: e.realAmount?.toString() };
		})
	);

	function editImport(i: number) {
		selectedMovement = movements[i];
		show4 = true;
	}
	function deleteIE(i: number) {
		selectedMovement = movements[i];
		show3 = true;
	}
	function editJobPO(i: number) {
		selectedMovement = movements[i];
		show5 = true;
	}
	function compareJob(i: number) {
		selectedMovement = movements[i];
		show2 = true;
	}

	async function handleDelete() {
		await api.delete('/po-imp/' + selectedMovement.id);
		selectedMovement = {};
		showSuccess('Movimiento eliminado');
		refetch(['po-imp']);
		show3 = false;
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-2 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['po-imp']))}
		action={''}
	>
		<Select
			menu
			class="min-w-36"
			items={options}
			bind:value={filters.type}
			onValueChange={() => refetch(['po-imp'])}
		/>
		<Select
			menu
			class="min-w-36"
			items={locations}
			allowDeselect
			bind:value={filters.location}
			onValueChange={() => refetch(['po-imp'])}
		/>
		<Input menu bind:value={filters.code} placeholder="Identificador" />
	</form>
	{#snippet right()}
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button><Pen class=" size-3.5" />Registrar</Button>
				<DropdownMenuContent>
					<DropdownMenuItem
						onclick={() => {
							selectedMovement = {};
							show4 = true;
						}}>Importacion</DropdownMenuItem
					>
					<DropdownMenuItem
						onclick={() => {
							selectedMovement = {};
							show5 = true;
						}}>Job - PO</DropdownMenuItem
					>
				</DropdownMenuContent>
			</DropdownMenuTrigger>
		</DropdownMenu>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead class="border-r-0"></TableHead>
		<TableHead class="w-[10%]">Importacion</TableHead>
		<TableHead class="w-[10%]">Job-PO</TableHead>
		<TableHead class="w-[10%]">Ubicacion</TableHead>
		<TableHead class="w-[10%]">Programacion</TableHead>
		<TableHead class="w-full">Fecha</TableHead>
	</TableHeader>
	<TableBody>
		{#each movements as movement, i}
			<TableRow>
				<OptionsCell
					editFunc={movement.import ? () => editImport(i) : () => editJobPO(i)}
					deleteFunc={() => deleteIE(i)}
					extraButtons={movement.jobpo
						? [{ fn: () => compareJob(i), name: 'Comparar', icon: Ruler }]
						: []}
				/>
				<TableCell>{movement.import || ''}</TableCell>
				<TableCell>{movement.jobpo || ''}</TableCell>
				<TableCell>{movement.location || ''}</TableCell>
				<TableCell>{movement.programation || ''}</TableCell>
				<TableCell>{formatDate(movement.due) || ''}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<JobComparisonCard bind:show={show2} bind:selectedJob={selectedMovement} />
<DeletePopUp
	bind:show={show3}
	text="¿Estás seguro de que quieres eliminar este movimiento?"
	deleteFunc={handleDelete}
/>
<ImportMovementsForm bind:show={show4} {selectedMovement} />
<ExportMovementsForm bind:show={show5} {selectedMovement} />
