<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { run } from 'svelte/legacy';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Dialog, DialogBody } from '$lib/components/ui/dialog';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import { Input } from '$lib/components/ui/input';
	import { formatDate, getImage, getPreview } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import DisplayInput from '$lib/components/ui/input/display-input.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Check,
		CircleUser,
		ClipboardList,
		Edit2Icon,
		FileText,
		History,
		LineChart
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import Select from '$lib/components/basic/Select.svelte';
	import EmployeeDocs from './EmployeeDocs.svelte';
	import EmployeeHistory from './EmployeeHistory.svelte';
	import EmployeeStats from './EmployeeStats.svelte';
	import EmployeeEvaluations from './EmployeeEvaluations.svelte';
	import { refetch } from '$lib/utils/query';
	import { civilStatus } from './employees.options';

	interface Props {
		show?: boolean;
		employee: any;
	}

	let { show = $bindable(false), employee = $bindable() }: Props = $props();
	let edit = $state(false);
	let formData: any = $state({});
	let files: FileList | undefined = $state();
	let preview: string = $state('');
	let tab = $state('');

	async function getFilePreview() {
		preview = (await getPreview(files?.[0])) || getImage(formData.photo) || '';
	}

	const banks = [
		{ value: 'SCOTIABANK', name: 'SCOTIABANK' },
		{ value: 'HSBC', name: 'HSBC' },
		{ value: 'BBVA', name: 'BBVA' }
	];
	const status = [
		{ value: 'Recontratable', name: 'Recontratable' },
		{ value: 'No recontratable', name: 'No recontratable' }
	];

	const positionTypes = [
		{ value: 'Tiempo completo', name: 'Tiempo completo' },
		{ value: 'Medio tiempo', name: 'Medio tiempo' },
		{ value: 'Practicante', name: 'Practicante' }
	];

	const shifts = [
		{ value: 'Diurno', name: 'Diurno' },
		{ value: 'Nocturno', name: 'Nocturno' }
	];

	const genres = [
		{ value: 'F', name: 'Femenino' },
		{ value: 'M', name: 'Masculino' },
		{ value: 'O', name: 'Otro' }
	];

	const routes = [
		{ value: '5y10 - Otay', name: '5y10 - Otay' },
		{ value: 'Nido - 10 de Mayo', name: 'Nido - 10 de Mayo' },
		{ value: 'Mariano - Chilpancingo', name: 'Mariano - Chilpancingo' },
		{ value: 'Villa del Campo - Terrazas', name: 'Villa del Campo - Terrazas' },
		{ value: 'Delicias - Natura', name: 'Delicias - Natura' }
	];

	const contracts = [
		{ value: 0, name: 'Prueba' },
		{ value: 1, name: 'Primer contrato' },
		{ value: 2, name: 'Segundo contrato' },
		{ value: 3, name: 'Tercer contrato' },
		{ value: 4, name: 'Base' }
	];

	let areas: any = $state();
	let positions: any = $state();
	let areasDisplay: any = $state({});
	let positionsDisplay: any = $state({});

	async function fetchOptions() {
		areas = (await api.get('/hrvarious/areas')).data;
		positions = (await api.get('/hrvarious/positions')).data;
		areas.forEach((area: any) => {
			areasDisplay[area.value] = { name: area.name, color: area.color };
		});
		positions.forEach((position: any) => {
			positionsDisplay[position.value] = { name: position.name, color: position.color };
		});
	}

	async function setFormData() {
		let [employeeData] = (await api.get(`/employees/${employee.id}`)).data;
		formData = {
			...employeeData,
			admissionDate: employeeData.admissionDate?.split('T')[0],
			bornDate: employeeData.bornDate?.split('T')[0],
			quitDate: employeeData.quitDate?.split('T')[0],
			resignationDate: employeeData.resignationDate?.split('T')[0],
			lastDay: employeeData.lastDay?.split('T')[0],
			bcpet: employeeData.bcpet?.split('T')[0],
			infonavitFee: employeeData.infonavitFee?.toString(),
			infonavitDiscount: employeeData.infonavitDiscount?.toString()
		};
	}

	function clean() {
		tab = 'info';
		files = undefined;
		edit = false;
	}

	async function handleSubmit() {
		const form = new FormData();
		form.append(
			'json',
			JSON.stringify({
				...formData,
				id: parseInt(formData.id || ''),
				areaId: parseInt(formData.areaId || ''),
				positionId: parseInt(formData.positionId || ''),
				sons: parseInt(formData.sons || ''),
				vacations: parseInt(formData.vacations || '')
			})
		);

		if (files) form.append('file', files[0]);

		if (employee.id) {
			await api.put('employees', form);
			employee = { ...employee, ...formData };
			showSuccess('Informacion actualizada');
		} else {
			const newId = (await api.post('employees', form)).data;
			employee.id = newId.toString();
			employee = { ...employee, ...formData };
			showSuccess('Empleado registrado');
		}

		refetch(['employees']);
		setFormData();
		edit = false;
	}

	onMount(() => {
		fetchOptions();
	});
	run(() => {
		if (files?.[0] || formData.photo) {
			preview = '/person.svg';
			getFilePreview();
		} else {
			preview = '/person.svg';
		}
	});
	run(() => {
		if (!show) clean();
	});
	run(() => {
		edit = !employee.id;
	});
	run(() => {
		if (employee.id) {
			setFormData();
		} else {
			formData = {};
		}
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="sm:max-w-4xl">
		<Tabs bind:value={tab}>
			<DialogHeader class="py-0">
				<TabsList class="h-10 w-min translate-y-[2.5px] gap-2.5 bg-transparent py-0">
					<TabsTrigger
						class="data-[state=active]:border-b-primary rounded-none border-b border-transparent px-0.5 py-2 !shadow-none "
						value="info"
					>
						<CircleUser class="mr-1.5 size-3.5" />Informacion
					</TabsTrigger>
					{#if employee.id}
						<TabsTrigger
							class="data-[state=active]:border-b-primary rounded-none border-b border-transparent px-0.5 py-2 !shadow-none "
							value="statics"
						>
							<LineChart class="mr-1.5 size-3.5" />Estadisticas</TabsTrigger
						>
						<TabsTrigger
							class="data-[state=active]:border-b-primary rounded-none border-b border-transparent px-0.5 py-2 !shadow-none "
							value="history"><History class="mr-1.5 size-3.5" />Historial</TabsTrigger
						>
						<TabsTrigger
							class="data-[state=active]:border-b-primary rounded-none border-b border-transparent px-0.5 py-2 !shadow-none "
							value="evaluations"><ClipboardList class="mr-1.5 size-3.5" />Evaluaciones</TabsTrigger
						>
						<TabsTrigger
							class="data-[state=active]:border-b-primary rounded-none border-b border-transparent px-0.5 py-2 !shadow-none "
							value="docs"
						>
							<FileText class="mr-1.5 size-3.5" />Documentos</TabsTrigger
						>
					{/if}
				</TabsList>
			</DialogHeader>

			<DialogBody class="h-[85lvh]">
				<div
					class="mb-8 grid grid-cols-[auto_1fr] grid-rows-[auto_auto] items-center gap-x-6 gap-y-1"
				>
					<div class="relative row-span-2 aspect-square size-24 cursor-pointer rounded-lg border">
						<div class="absolute -right-2.5 -top-2.5">
							{#if edit}
								<Button
									size="icon"
									variant="ghost"
									class="bg-background size-7 border"
									onclick={handleSubmit}><Check class="size-3.5" /></Button
								>
							{:else}
								<Button
									size="icon"
									variant="ghost"
									class="bg-background size-7 border"
									onclick={() => {
										edit = true;
										tab = 'info';
									}}><Edit2Icon class="size-3.5" /></Button
								>
							{/if}
						</div>

						{#if edit}
							<label class="aspect-square w-full">
								<img
									class="h-full w-full cursor-pointer rounded-lg object-cover"
									src={preview || '/person.svg'}
									alt=""
								/>
								<input type="file" bind:files class="hidden" disabled={!edit} accept="image/*" />
							</label>
						{:else}
							<Popover.Root>
								<Popover.Trigger class="aspect-square h-min w-full rounded-lg p-0">
									<img
										class="h-full w-full rounded-lg object-cover"
										src={preview || '/person.svg'}
										alt=""
									/>
								</Popover.Trigger>
								<Popover.Content>
									<img
										class="h-full w-full rounded-lg object-cover"
										src={preview || '/person.svg'}
										alt=""
									/>
								</Popover.Content>
							</Popover.Root>
						{/if}
					</div>

					<div class="flex gap-2">
						{#if edit}
							<div>
								<p class="text-muted-foreground text-xs">Nombre:</p>
								<DisplayInput bind:value={formData.name} {edit} />
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Apellido paterno:</p>
								<DisplayInput bind:value={formData.paternalLastName} {edit} />
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Apellido materno:</p>
								<DisplayInput bind:value={formData.maternalLastName} {edit} />
							</div>
							<div>
								<p class="text-muted-foreground text-xs">No:</p>
								<DisplayInput bind:value={formData.noEmpleado} {edit} class="max-w-20" />
							</div>
						{:else}
							<p class="text-lg font-semibold">
								{`${formData.name} ${formData.paternalLastName || ''} ${formData.maternalLastName || ''}`}
							</p>
							<p class="text-lg font-semibold">{formData.noEmpleado}</p>
						{/if}
					</div>
					<div class="mb-auto flex flex-col gap-1.5">
						<Select
							items={areas}
							bind:value={formData.areaId}
							class="h-auto w-min min-w-48 border-none p-0 focus-visible:ring-0 disabled:opacity-100"
							chevron={false}
							disabled={!edit}
						>
							<Badge color={areasDisplay[formData.areaId || '']?.color}
								>{areasDisplay[formData.areaId || '']?.name || 'Area'}</Badge
							>
						</Select>
						<Select
							items={positions}
							bind:value={formData.positionId}
							class="h-auto w-min min-w-48 border-none p-0 focus-visible:ring-0 disabled:opacity-100"
							chevron={false}
							disabled={!edit}
						>
							<Badge color={positionsDisplay[formData.positionId || '']?.color}
								>{positionsDisplay[formData.positionId || '']?.name || 'Posicion'}</Badge
							>
						</Select>
					</div>
				</div>
				<TabsContent value="info">
					{#if !employee.id}
						<div
							class="relative mb-6 grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4"
						>
							<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
								Formato
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Fecha del formato:</p>
								<DisplayInput value={formData.formatDate} {edit}>
									<Input type="date" bind:value={formData.formatDate} />
								</DisplayInput>
							</div>
						</div>
					{/if}

					{#if !formData.active && employee.id}
						<div
							class="relative mb-6 grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4"
						>
							<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">Baja</div>
							<div>
								<p class="text-muted-foreground text-xs">Razón de Salida:</p>
								<DisplayInput bind:value={formData.quitReason} {edit} />
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Estatus de Salida:</p>
								<DisplayInput value={formData.quitStatus} {edit}>
									<Select items={status} bind:value={formData.quitStatus} />
								</DisplayInput>
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Notas de Salida:</p>
								<DisplayInput bind:value={formData.quitNotes} {edit} />
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Fecha de Salida:</p>
								<DisplayInput value={formData.quitDate} {edit}>
									<Input type="date" bind:value={formData.quitDate} />
								</DisplayInput>
							</div>

							<div>
								<p class="text-muted-foreground text-xs">Fecha de renuncia:</p>
								<DisplayInput value={formData.resignationDate} {edit}>
									<Input type="date" bind:value={formData.resignationDate} />
								</DisplayInput>
							</div>
							<div>
								<p class="text-muted-foreground text-xs">Ultimo dia:</p>
								<DisplayInput value={formData.lastDay} {edit}>
									<Input type="date" bind:value={formData.lastDay} />
								</DisplayInput>
							</div>
						</div>
					{/if}

					<div class="relative mb-6 grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4">
						<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">Contacto</div>
						<div>
							<p class="text-muted-foreground text-xs">Correo Electrónico:</p>
							<DisplayInput bind:value={formData.email} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Número de Teléfono:</p>
							<DisplayInput bind:value={formData.number} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Dirección:</p>
							<DisplayInput bind:value={formData.direction} {edit} />
						</div>
					</div>

					<div class="relative mb-6 grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4">
						<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">Personal</div>
						<div>
							<p class="text-muted-foreground text-xs">Nacionalidad:</p>
							<DisplayInput bind:value={formData.nationality} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Estado Civil:</p>
							<DisplayInput value={formData.civilStatus} {edit}>
								<Select items={civilStatus} bind:value={formData.civilStatus} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Fecha de Nacimiento:</p>
							<DisplayInput value={formData.bornDate} {edit}>
								<Input type="date" bind:value={formData.bornDate} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Estudios:</p>
							<DisplayInput bind:value={formData.studies} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Género:</p>
							<DisplayInput bind:value={formData.genre} {edit}>
								<Select items={genres} bind:value={formData.genre} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Número de Hijos:</p>
							<DisplayInput bind:value={formData.sons} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Lugar de Nacimiento:</p>
							<DisplayInput bind:value={formData.bornLocation} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Tipo de Sangre:</p>
							<DisplayInput bind:value={formData.blood} {edit} />
						</div>
					</div>

					<div class="relative mb-6 grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4">
						<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">Legal</div>
						<div>
							<p class="text-muted-foreground text-xs">NSS:</p>
							<DisplayInput bind:value={formData.nss} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">CURP:</p>
							<DisplayInput bind:value={formData.curp} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">RFC:</p>
							<DisplayInput bind:value={formData.rfc} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Cuenta Bancaria:</p>
							<DisplayInput bind:value={formData.account} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Banco:</p>
							<DisplayInput bind:value={formData.bank} {edit}>
								<Select items={banks} bind:value={formData.bank} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Número de Infonavit:</p>
							<DisplayInput bind:value={formData.infonavitNo} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Descuento de Infonavit:</p>
							<DisplayInput bind:value={formData.infonavitDiscount} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Salario de Nómina:</p>
							<DisplayInput bind:value={formData.nominaSalary} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Número de Clínica:</p>
							<DisplayInput bind:value={formData.clinicNo} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Salario de IMSS:</p>
							<DisplayInput bind:value={formData.immsSalary} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Número de Fonacot:</p>
							<DisplayInput bind:value={formData.fonacotNo} {edit} />
						</div>
					</div>

					<div class="relative mb-6 grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4">
						<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">Empresa</div>

						<div>
							<p class="text-muted-foreground text-xs">Antiguedad:</p>
							<DisplayInput value={formatDate(formData.admissionDate)} {edit}>
								<Input type="date" bind:value={formData.admissionDate} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Fecha de Bcpet:</p>
							<DisplayInput value={formatDate(formData.bcpet)} {edit}>
								<Input type="date" bind:value={formData.bcpet} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Tipo de Posición:</p>
							<DisplayInput value={formData.positionType} {edit}>
								<Select items={positionTypes} bind:value={formData.positionType} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Turno:</p>
							<DisplayInput value={formData.shift} {edit}>
								<Select items={shifts} bind:value={formData.shift} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Ruta de camión:</p>
							<DisplayInput value={formData.route} {edit}>
								<Select items={routes} bind:value={formData.route} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Tipo de contrato:</p>
							<DisplayInput
								value={contracts.find((c: any) => c.value === formData.contract)?.name}
								{edit}
							>
								<Select items={contracts} bind:value={formData.contract} />
							</DisplayInput>
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Jefe directo:</p>
							<DisplayInput bind:value={formData.boss} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Departamento:</p>
							<DisplayInput bind:value={formData.department} {edit} />
						</div>
					</div>

					<div class="relative grid w-full grid-cols-2 gap-x-4 gap-y-2 rounded-md border p-4">
						<div class="bg-background absolute -top-5 left-8 my-2 px-2 font-semibold">
							Contacto de Emergencia
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Contacto de Emergencia:</p>
							<DisplayInput bind:value={formData.emergencyContact} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Número de Emergencia:</p>
							<DisplayInput bind:value={formData.emergencyNumber} {edit} />
						</div>
						<div>
							<p class="text-muted-foreground text-xs">Parentesco:</p>
							<DisplayInput bind:value={formData.emergencyRelationship} {edit} />
						</div>
					</div>
				</TabsContent>
				<TabsContent value="statics">
					<EmployeeStats bind:employee />
				</TabsContent>
				<TabsContent value="docs">
					<EmployeeDocs bind:employee />
				</TabsContent>
				<TabsContent value="evaluations">
					<EmployeeEvaluations bind:employee />
				</TabsContent>
				<TabsContent value="history">
					<EmployeeHistory bind:employee />
				</TabsContent>
			</DialogBody>
		</Tabs>
	</DialogContent>
</Dialog>
