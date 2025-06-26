<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import api from '$lib/utils/server';
	import EmployeeCard from './EmployeeCard.svelte';
	import QuitEmployeeForm from './QuitEmployeeForm.svelte';
	import ReactivateForm from './ReactivateForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import {
		RotateCcw,
		FileDown,
		PlusCircle,
		Grid3x3,
		Grid2X2,
		DollarSignIcon,
		UserRoundMinus
	} from 'lucide-svelte';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import EmployeeSalaryForm from './EmployeeSalaryForm.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { downloadFile } from '$lib/utils/files';
	import { getAreas, getOptions, getPositions } from '$lib/utils/queries';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show1: boolean = $state(false);
	let show2: boolean = $state(false);
	let show3: boolean = $state(false);
	let show4: boolean = $state(false);

	let selectedEmployee: any = $state({});
	let searchParams = $state({
		noEmpleado: '',
		name: '',
		areaId: '',
		positionId: ''
	});

	let searchActive: boolean = $state(true);

	const areas = createQuery({
		queryKey: ['areas'],
		queryFn: getAreas
	});
	const positions = createQuery({
		queryKey: ['positions'],
		queryFn: getPositions
	});
	const employees = createQuery({
		queryKey: ['employees'],
		queryFn: async () => (await api.get('/employees', { params: { active: searchActive } })).data
	});

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
	function viewSalary(i: number) {
		selectedEmployee = filteredEmployees[i];
		show4 = true;
	}
	function reactivateEmployee(i: number) {
		selectedEmployee = filteredEmployees[i];
		show3 = true;
	}

	async function exportList(mode?: 'full') {
		const url = mode === 'full' ? '/employees/export' : '/employees/export-basic';
		downloadFile({
			url,
			name: 'Empleados.xlsx'
		});
	}

	let filteredEmployees = $derived(
		$employees?.data?.filter((e: any) => {
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
			items={getOptions($areas.data)}
			placeholder="Área"
			class="min-w-48"
		></Select>
		<Select
			menu
			allowDeselect
			bind:value={searchParams.positionId}
			items={getOptions($positions.data)}
			placeholder="Posición"
			class="min-w-72"
		></Select>

		<Select
			class="min-w-28"
			menu
			value={searchActive.toString()}
			onValueChange={() => {
				searchActive = !searchActive;
				refetch(['employees']);
			}}
			items={[
				{ name: 'Activos', value: 'true', color: 'green' },
				{ name: 'Inactivos', value: 'false', color: 'red' }
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
			<OptionsHead />
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
					extraButtons={employee.active
						? [
								{
									fn: () => deleteEmployee(i),
									name: 'Baja',
									icon: UserRoundMinus
								},
								{
									fn: () => viewSalary(i),
									name: 'Salario',
									icon: DollarSignIcon
								}
							]
						: [
								{
									fn: () => reactivateEmployee(i),
									name: 'Recontratar',
									icon: RotateCcw
								}
							]}
				></OptionsCell>
				<TableCell>{employee.noEmpleado || ''}</TableCell>
				<TableCell class="cursor-pointer whitespace-nowrap" onclick={() => previewEmployee(i)}
					>{employee.name || ''}</TableCell
				>
				<TableCell>{employee.paternalLastName || ''}</TableCell>
				<TableCell>{employee.maternalLastName || ''}</TableCell>
				<TableCell
					><Badge color={$areas.data?.[employee.areaId || '']?.color}
						>{$areas.data?.[employee.areaId || '']?.name}</Badge
					></TableCell
				>
				<TableCell
					><Badge color={$positions.data?.[employee.positionId || '']?.color}
						>{$positions.data?.[employee.positionId || '']?.name || ''}</Badge
					>
				</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<EmployeeCard bind:show={show1} bind:employee={selectedEmployee} />
<QuitEmployeeForm bind:show={show2} bind:selectedEmployee />
<EmployeeSalaryForm bind:show={show4} bind:selectedEmployee />
<ReactivateForm bind:show={show3} bind:selectedEmployee />
