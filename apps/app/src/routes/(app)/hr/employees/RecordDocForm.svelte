<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import api from '$lib/utils/server';
	import { Loader2 } from 'lucide-svelte';
	import { quitReasons, quitStatus, salaryReasons } from './employees.options';

	interface Props {
		id: string;
		open: boolean;
	}

	let { id = $bindable(), open = $bindable() }: Props = $props();

	const properties = {
		id: { label: 'ID', type: 'text' },
		noEmpleado: { label: 'Número de empleado', type: 'text' },
		nss: { label: 'NSS', type: 'text' },
		curp: { label: 'CURP', type: 'text' },
		rfc: { label: 'RFC', type: 'text' },
		blood: { label: 'Tipo de sangre', type: 'text' },
		account: { label: 'Cuenta bancaria', type: 'text' },
		emergencyContact: { label: 'Contacto de emergencia', type: 'text' },
		emergencyRelationship: { label: 'Parentesco de emergencia', type: 'text' },
		positionId: { label: 'ID de puesto', type: 'text' },
		admissionDate: { label: 'Fecha de ingreso', type: 'date' },
		active: { label: 'Activo', type: 'checkbox' },
		emergencyNumber: { label: 'Tel. de emergencia', type: 'text' },
		areaId: { label: 'ID de área', type: 'text' },
		quitDate: { label: 'Fecha de baja', type: 'date' },
		bornLocation: { label: 'Lugar de nacimiento', type: 'text' },
		genre: { label: 'Género', type: 'select' },
		sons: { label: 'Número de hijos', type: 'number' },
		clinicNo: { label: 'Número de clínica', type: 'text' },
		email: { label: 'Correo electrónico', type: 'email' },
		number: { label: 'Número telefónico', type: 'text' },
		direction: { label: 'Dirección', type: 'textarea' },
		bank: { label: 'Banco', type: 'text' },
		infonavitNo: { label: 'Número INFONAVIT', type: 'text' },
		infonavitFee: { label: 'Cuota INFONAVIT', type: 'number' },
		infonavitDiscount: { label: 'Descuento INFONAVIT', type: 'number' },
		positionType: { label: 'Tipo de puesto', type: 'text' },
		cim: { label: 'CIM', type: 'text' },
		shift: { label: 'Turno', type: 'text' },
		nominaSalary: { label: 'Salario nómina', type: 'number' },
		immsSalary: { label: 'Salario IMSS', type: 'number' },
		newSalary: { label: 'Nuevo salario', type: 'number' },
		reason: { label: 'Motivo', type: 'select', options: salaryReasons },
		reasonComment: { label: 'Comentario del motivo', type: 'textarea' },
		petitioner: { label: 'Solicitante', type: 'text' },
		comments: { label: 'Comentarios', type: 'textarea' },
		name: { label: 'Nombre', type: 'text' },
		paternalLastName: { label: 'Apellido paterno', type: 'text' },
		maternalLastName: { label: 'Apellido materno', type: 'text' },
		nationality: { label: 'Nacionalidad', type: 'text' },
		civilStatus: { label: 'Estado civil', type: 'select' },
		bornDate: { label: 'Fecha de nacimiento', type: 'date' },
		studies: { label: 'Estudios', type: 'text' },
		quitReason: { label: 'Motivo de baja', type: 'select', options: quitReasons },
		quitStatus: { label: 'Estatus de baja', type: 'select', options: quitStatus },
		quitNotes: { label: 'Notas de baja', type: 'textarea' },
		vacations: { label: 'Vacaciones', type: 'text' },
		photo: { label: 'Foto', type: 'image' },
		bcpet: { label: 'BCPET', type: 'date' },
		route: { label: 'Ruta', type: 'text' },
		contract: { label: 'Contrato', type: 'text' },
		department: { label: 'Departamento', type: 'text' },
		boss: { label: 'Jefe directo', type: 'text' },
		resignationDate: { label: 'Fecha de renuncia', type: 'date' },
		lastDay: { label: 'Último día', type: 'date' },
		area: { label: 'Área', type: 'text' },
		position: { label: 'Puesto', type: 'text' },
		type: { label: 'Tipo de cambio', type: 'text' },
		date: { label: 'Fecha', type: 'date' }
	};

	let selectedProperty = $state('');

	let data = $state<any>({});
	let formData = $state<any>({});
	let loading = $state(false);
	let availableProperties = $state<any>({});

	async function loadData() {
		loading = true;
		data = (await api.get(`/employees/history/doc/${id}`)).data;
		formData = { ...data };
		loading = false;
	}

	async function saveData() {
		await api.put(`/employees/history/doc`, {
			id,
			doc: {
				...data,
				[selectedProperty]: formData[selectedProperty]
			}
		});
		open = false;
	}

	$effect(() => {
		if (open) loadData();
	});

	const defaultProperties: (keyof typeof properties)[] = [
		'name',
		'paternalLastName',
		'maternalLastName',
		'noEmpleado',
		'admissionDate'
	];

	$effect(() => {
		if (data.type === 'salario')
			setAvailableProperties([
				...defaultProperties,
				'reason',
				'reasonComment',
				'petitioner',
				'nominaSalary',
				'newSalary',
				'date',
				'comments'
			]);
		if (data.type === 'baja')
			setAvailableProperties([
				...defaultProperties,
				'quitReason',
				'quitStatus',
				'quitNotes',
				'quitDate',
				'resignationDate',
				'lastDay',
				'boss',
				'department',
				'nss',
				'position'
			]);
		if (data.type === 'alta')
			setAvailableProperties([
				...defaultProperties,
				'direction',
				'number',
				'civilStatus',
				'curp',
				'rfc',
				'nss',
				'clinicNo',
				'bornLocation',
				'bornDate',
				'admissionDate',
				'position',
				'area',
				'department',
				'boss',
				'email',
				'emergencyNumber',
				'emergencyContact',
				'emergencyRelationship',
				'nominaSalary'
			]);
	});

	function setAvailableProperties(keys: (keyof typeof properties)[]) {
		availableProperties = keys.reduce(
			(acc, key) => {
				acc[key] = properties[key as keyof typeof properties];
				return acc;
			},
			{} as Record<string, any>
		);
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Modificar documento</Dialog.Title>
		</Dialog.Header>

		<Dialog.Body>
			{#if loading}
				<div class="flex items-center justify-center">
					<Loader2 class="size-4 animate-spin" />
				</div>
			{:else}
				<Select
					class="mt-2"
					items={Object.keys(availableProperties).map((key) => ({
						value: key,
						name: availableProperties[key as keyof typeof availableProperties]?.label
					}))}
					bind:value={selectedProperty}
				/>

				{#if selectedProperty}
					{#if availableProperties[selectedProperty as keyof typeof availableProperties].type === 'text'}
						<Input class="mt-2" bind:value={formData[selectedProperty]} />
					{/if}
					{#if availableProperties[selectedProperty as keyof typeof availableProperties].type === 'date'}
						<Input type="date" class="mt-2" bind:value={formData[selectedProperty]} />
					{/if}
					{#if availableProperties[selectedProperty as keyof typeof availableProperties].type === 'number'}
						<Input type="number" class="mt-2" bind:value={formData[selectedProperty]} />
					{/if}
					{#if availableProperties[selectedProperty as keyof typeof availableProperties].type === 'select'}
						<Select
							class="mt-2"
							items={availableProperties[selectedProperty as keyof typeof availableProperties]
								.options}
							bind:value={formData[selectedProperty]}
						/>
					{/if}
				{/if}
			{/if}
			<Button class="mt-2" onclick={saveData}>Guardar</Button>
		</Dialog.Body>
	</Dialog.Content>
</Dialog.Root>
