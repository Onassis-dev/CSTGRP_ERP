<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import api from '$lib/utils/server';
	import { Loader2 } from 'lucide-svelte';
	import { quitReasons, quitStatus, salaryReasons } from './employees.options';
	import { showSuccess } from '$lib/utils/showToast';
	import { Textarea } from '$lib/components/ui/textarea';

	interface Props {
		id: string;
		open: boolean;
	}

	let { id = $bindable(), open = $bindable() }: Props = $props();

	const properties = {
		active: { label: 'Activo', type: 'checkbox' },
		maternalLastName: { label: 'Apellido materno', type: 'text' },
		paternalLastName: { label: 'Apellido paterno', type: 'text' },
		area: { label: 'Área', type: 'text' },
		bank: { label: 'Banco', type: 'text' },
		bcpet: { label: 'BCPET', type: 'date' },
		cim: { label: 'CIM', type: 'text' },
		reasonComment: { label: 'Comentario del motivo', type: 'textarea' },
		comments: { label: 'Comentarios', type: 'textarea' },
		emergencyContact: { label: 'Contacto de emergencia', type: 'text' },
		contract: { label: 'Contrato', type: 'text' },
		email: { label: 'Correo electrónico', type: 'text' },
		account: { label: 'Cuenta bancaria', type: 'text' },
		infonavitFee: { label: 'Cuota INFONAVIT', type: 'number' },
		curp: { label: 'CURP', type: 'text' },
		department: { label: 'Departamento', type: 'text' },
		infonavitDiscount: { label: 'Descuento INFONAVIT', type: 'number' },
		direction: { label: 'Dirección', type: 'textarea' },
		civilStatus: { label: 'Estado civil', type: 'select' },
		quitStatus: { label: 'Estatus de baja', type: 'select', options: quitStatus },
		studies: { label: 'Estudios', type: 'text' },
		changeDate: { label: 'Fecha', type: 'date' },
		quitDate: { label: 'Fecha de baja', type: 'date' },
		admissionDate: { label: 'Fecha de ingreso', type: 'date' },
		bornDate: { label: 'Fecha de nacimiento', type: 'date' },
		resignationDate: { label: 'Fecha de renuncia', type: 'date' },
		formatDate: { label: 'Fecha del formato', type: 'date' },
		photo: { label: 'Foto', type: 'image' },
		genre: { label: 'Género', type: 'select' },
		id: { label: 'ID', type: 'text' },
		areaId: { label: 'ID de área', type: 'text' },
		positionId: { label: 'ID de puesto', type: 'text' },
		boss: { label: 'Jefe directo', type: 'text' },
		bornLocation: { label: 'Lugar de nacimiento', type: 'text' },
		salaryReason: { label: 'Motivo', type: 'select', options: salaryReasons },
		quitReason: { label: 'Motivo de baja', type: 'select', options: quitReasons },
		nationality: { label: 'Nacionalidad', type: 'text' },
		name: { label: 'Nombre', type: 'text' },
		quitNotes: { label: 'Notas de baja', type: 'textarea' },
		nss: { label: 'NSS', type: 'text' },
		newSalary: { label: 'Nuevo salario', type: 'number' },
		clinicNo: { label: 'Número de clínica', type: 'text' },
		noEmpleado: { label: 'Número de empleado', type: 'text' },
		sons: { label: 'Número de hijos', type: 'number' },
		fonacotNo: { label: 'Número FONACOT', type: 'text' },
		infonavitNo: { label: 'Número INFONAVIT', type: 'text' },
		number: { label: 'Número telefónico', type: 'text' },
		emergencyRelationship: { label: 'Parentesco de emergencia', type: 'text' },
		position: { label: 'Puesto', type: 'text' },
		rfc: { label: 'RFC', type: 'text' },
		route: { label: 'Ruta', type: 'text' },
		oldSalary: { label: 'Salario anterior', type: 'number' },
		immsSalary: { label: 'Salario IMSS', type: 'number' },
		nominaSalary: { label: 'Salario nómina', type: 'number' },
		petitioner: { label: 'Solicitante', type: 'text' },
		emergencyNumber: { label: 'Tel. de emergencia', type: 'text' },
		type: { label: 'Tipo de cambio', type: 'text' },
		positionType: { label: 'Tipo de puesto', type: 'text' },
		blood: { label: 'Tipo de sangre', type: 'text' },
		shift: { label: 'Turno', type: 'text' },
		lastDay: { label: 'Último día', type: 'date' },
		vacations: { label: 'Vacaciones', type: 'text' }
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
		let value = formData[selectedProperty];
		if (value === '') value = null;

		await api.put(`/employees/history/doc`, {
			id,
			doc: {
				...data,
				[selectedProperty]: value
			}
		});
		showSuccess('Actualizado');
	}

	$effect(() => {
		if (open) loadData();
	});

	const defaultProperties: (keyof typeof properties)[] = [
		'formatDate',
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
				'salaryReason',
				'reasonComment',
				'petitioner',
				'oldSalary',
				'newSalary',
				'changeDate',
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
				'nominaSalary',
				'infonavitNo',
				'account',
				'fonacotNo'
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
					{#if availableProperties[selectedProperty as keyof typeof availableProperties].type === 'textarea'}
						<Textarea class="mt-2" bind:value={formData[selectedProperty]} />
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
