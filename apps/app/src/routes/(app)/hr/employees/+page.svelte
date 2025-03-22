<script lang="ts">
	import { run } from 'svelte/legacy';
	import { Input } from '$lib/components/ui/input';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import api from '$lib/utils/server';
	import { onMount } from 'svelte';
	import EmployeeCard from './EmployeeCard.svelte';
	import QuitEmployeeForm from './QuitEmployeeForm.svelte';
	import ReactivateForm from './ReactivateForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { RotateCcw, FileDown, PlusCircle, Grid3x3, Grid2X2 } from 'lucide-svelte';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import Select from '$lib/components/basic/Select.svelte';

	let show1: boolean = $state(false);
	let show2: boolean = $state(false);
	let show3: boolean = $state(false);
	let selectedEmployee: any = $state({});
	let employees: any[] = $state([]);
	let searchParams = $state({
		noEmpleado: '',
		name: '',
		areaId: '',
		positionId: ''
	});

	let areas: any = $state({});
	let positions: any = $state({});
	let areasOptions: any = $state([]);
	let positionsOptions: any = $state([]);
	let searchActive: string = $state('active');

	async function fetchOptions() {
		areasOptions = (await api.get('/hrvarious/areas')).data;
		areasOptions.forEach((area: any) => {
			areas[area.value] = { name: area.name, color: area.color };
		});
		positionsOptions = (await api.get('/hrvarious/positions')).data;
		positionsOptions.forEach((position: any) => {
			positions[position.value] = { name: position.name, color: position.color };
		});
	}

	async function getEmployees() {
		if (searchActive === 'active') {
			const result = await api.get('/employees');
			employees = result.data;
		} else {
			const result = await api.get('/employees/inactive');
			employees = result.data;
		}
	}

	function createEmployee() {
		selectedEmployee = {};
		show1 = true;
	}
	function previewEmployee(i: number) {
		selectedEmployee = filteredEmployees[i];
		show1 = true;
	}
	function deleteEmployee(i: number) {
		selectedEmployee = filteredEmployees[i];
		show2 = true;
	}
	function reactivateEmployee(i: number) {
		selectedEmployee = filteredEmployees[i];
		show3 = true;
	}

	async function exportList(mode?: 'full') {
		const url = mode === 'full' ? '/employees/export' : '/employees/export-basic';
		const response = await api.get(url, {
			responseType: 'arraybuffer'
		});

		const blob = new Blob([response.data], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = 'Empleados.xlsx';

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);
	}

	onMount(async () => {
		await fetchOptions();
		getEmployees();
	});

	$effect(() => {
		if (searchActive) getEmployees();
	});

	let filteredEmployees = $derived(
		employees.filter((e) => {
			const noMatch = searchParams.noEmpleado
				? e.noEmpleado.toString().includes(searchParams.noEmpleado)
				: true;
			const nameMatch = searchParams.name
				? e.name?.toUpperCase()?.includes(searchParams.name.toUpperCase()) ||
					e.paternalLastName?.toUpperCase()?.includes(searchParams.name.toUpperCase()) ||
					e.maternalLastName?.toUpperCase()?.includes(searchParams.name.toUpperCase())
				: true;
			const areaMatch = searchParams.areaId ? e.areaId === searchParams.areaId : true;
			const positionMatch = searchParams.positionId
				? e.positionId === searchParams.positionId
				: true;
			return nameMatch && areaMatch && positionMatch && noMatch;
		})
	);
</script>

<MenuBar>
	{#snippet left()}
		<Input menu bind:value={searchParams.noEmpleado} placeholder="No." class="w-20" />
		<Input menu bind:value={searchParams.name} placeholder="Nombre" class="w-32" />

		<Select
			menu
			allowDeselect
			bind:value={searchParams.areaId}
			items={areasOptions}
			placeholder="Área"
			class="min-w-48"
		></Select>
		<Select
			menu
			allowDeselect
			bind:value={searchParams.positionId}
			items={positionsOptions}
			placeholder="Posición"
			class="min-w-72"
		></Select>

		<Select
			class="min-w-28"
			menu
			bind:value={searchActive}
			items={[
				{ name: 'Activos', value: 'active' },
				{ name: 'Inactivos', value: 'inactive' }
			]}
		></Select>
	{/snippet}
	{#snippet right()}
		<DropdownMenu>
			<DropdownMenuTrigger class="h-7">
				<Button size="icon" variant="outline"><FileDown class="size-3.5" /></Button>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onclick={() => exportList()}
						><Grid2X2 class="size-3.5 " strokeWidth={1.6} /> Basico</DropdownMenuItem
					>
					<DropdownMenuItem onclick={() => exportList('full')}
						><Grid3x3 class="size-3.5 " strokeWidth={1.6} />Completo</DropdownMenuItem
					>
				</DropdownMenuContent>
			</DropdownMenuTrigger>
		</DropdownMenu>
		<Button onclick={createEmployee}><PlusCircle class=" size-3.5" />Añadir empleado</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableRow>
			<TableHead class="fixed left-0 z-30 bg-inherit p-1"></TableHead>
			<TableHead>No. empleado</TableHead>
			<TableHead class="w-1/4">Nombre</TableHead>
			<TableHead class="w-1/4">Apellido Paterno</TableHead>
			<TableHead class="w-1/4">Apellido Materno</TableHead>
			<TableHead>Área</TableHead>
			<TableHead>Posición</TableHead>
		</TableRow>
	</TableHeader>
	<TableBody>
		{#each filteredEmployees as employee, i}
			<TableRow>
				<OptionsCell
					viewFunc={() => previewEmployee(i)}
					deleteFunc={employee.active ? () => deleteEmployee(i) : undefined}
				>
					{#if !employee.active}
						<DropdownMenuItem onclick={() => reactivateEmployee(i)}>
							<RotateCcw class="size-3.5" /> Recontratar
						</DropdownMenuItem>
					{/if}
				</OptionsCell>
				<TableCell>{employee.noEmpleado || ''}</TableCell>
				<TableCell class="cursor-pointer whitespace-nowrap" onclick={() => previewEmployee(i)}
					>{employee.name || ''}</TableCell
				>
				<TableCell>{employee.paternalLastName || ''}</TableCell>
				<TableCell>{employee.maternalLastName || ''}</TableCell>
				<TableCell
					><Badge color={areas[employee.areaId || '']?.color}
						>{areas[employee.areaId || '']?.name}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={positions[employee.positionId || '']?.color}
						>{positions[employee.positionId || '']?.name || ''}</Badge
					>
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<EmployeeCard bind:show={show1} bind:employee={selectedEmployee} reload={getEmployees} />
<QuitEmployeeForm bind:show={show2} bind:selectedEmployee reload={getEmployees} />
<ReactivateForm bind:show={show3} bind:selectedEmployee reload={getEmployees} />
