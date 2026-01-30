<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogFooter,
		DialogHeader,
		DialogContent
	} from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import { onMount, untrack } from 'svelte';
	import Label from '$lib/components/basic/Label.svelte';
	import { civilStatus } from './employees.options';

	interface Props {
		show?: boolean;
		selectedEmployee: any;
	}

	let { show = $bindable(false), selectedEmployee = $bindable({}) }: Props = $props();

	let areas: any = $state();
	let positions: any = $state();

	async function fetchOptions() {
		areas = (await api.get('/hrvarious/areas')).data;
		positions = (await api.get('/hrvarious/positions')).data;
	}

	let formData: any = $state({
		id: selectedEmployee.id,
		admissionDate: new Date().toISOString().split('T')[0],
		formatDate: new Date().toISOString().split('T')[0],
		areaId: '',
		positionId: '',
		email: '',
		number: '',
		account: '',
		nominaSalary: '',
		boss: '',
		direction: '',
		civilStatus: '',
		emergencyContact: '',
		emergencyRelationship: '',
		emergencyNumber: ''
	});

	async function setFormData() {
		let [employeeData] = (await api.get(`/employees/${selectedEmployee.id}`)).data;
		formData = { ...formData, ...employeeData };
	}

	async function handleSubmmit() {
		await api.put('/employees/reactivate', {
			...formData,
			id: parseInt(selectedEmployee.id || '0'),
			positionId: parseInt(formData.positionId || '0'),
			areaId: parseInt(formData.areaId || '0'),
			nominaSalary: parseFloat(formData.nominaSalary || '0')
		});

		show = false;
		showSuccess('Empleado dado de alta');
		formData = {
			id: '',
			admissionDate: '',
			formatDate: '',
			areaId: '',
			positionId: '',
			email: '',
			number: '',
			account: '',
			nominaSalary: '',
			boss: '',
			direction: '',
			civilStatus: '',
			emergencyContact: '',
			emergencyRelationship: '',
			emergencyNumber: ''
		};
	}

	onMount(() => {
		show = false;
		refetch(['employees']);
		fetchOptions();
	});

	$effect(() => {
		if (selectedEmployee) untrack(() => setFormData());
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title="Recontratar a: {selectedEmployee.name} - {selectedEmployee.noEmpleado}" />
		<DialogBody grid="2">
			<Label name="Fecha del formato">
				<Input type="date" bind:value={formData.formatDate} />
			</Label>
			<Label name="Fecha de Alta">
				<Input type="date" bind:value={formData.admissionDate} />
			</Label>
			<Label name="Area">
				<Select items={areas} bind:value={formData.areaId} placeholder="Elige una opcion" />
			</Label>
			<Label name="Posicion">
				<Select items={positions} bind:value={formData.positionId} placeholder="Elige una opcion" />
			</Label>
			<Label name="Email">
				<Input type="email" bind:value={formData.email} />
			</Label>
			<Label name="Telefono">
				<Input bind:value={formData.number} />
			</Label>
			<Label name="Cuenta bancaria">
				<Input bind:value={formData.account} />
			</Label>
			<Label name="Salario nomina">
				<Input type="number" bind:value={formData.nominaSalary} />
			</Label>
			<Label name="Jefe">
				<Input bind:value={formData.boss} />
			</Label>
			<Label name="Direccion">
				<Input bind:value={formData.direction} />
			</Label>
			<Label name="Estado civil">
				<Select items={civilStatus} bind:value={formData.civilStatus} />
			</Label>
			<Label name="Contacto de emergencia">
				<Input bind:value={formData.emergencyContact} />
			</Label>
			<Label name="Parentesco de emergencia">
				<Input bind:value={formData.emergencyRelationship} />
			</Label>
			<Label name="Telefono de emergencia">
				<Input bind:value={formData.emergencyNumber} />
			</Label>
		</DialogBody>
		<DialogFooter hideFunc={() => (show = false)}>
			<Button onclick={handleSubmmit}>Recontratar</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
