<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogBody, DialogFooter, DialogHeader } from '$lib/components/ui/dialog';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import { onMount } from 'svelte';
	import { salaryReasons } from './employees.options';
	import Label from '$lib/components/basic/Label.svelte';

	interface Props {
		show?: boolean;
		selectedEmployee: any;
	}

	let { show = $bindable(false), selectedEmployee = $bindable({}) }: Props = $props();

	let formData = $state({
		id: selectedEmployee.id,
		salaryReason: '',
		reasonComment: '',
		newSalary: '',
		changeDate: '',
		petitioner: '',
		comments: '',
		formatDate: ''
	});

	async function handleSubmmit() {
		await api.put('/employees/salary', {
			...formData,
			id: Number(selectedEmployee.id || '0')
		});

		show = false;
		showSuccess('Salario actualizado');
		formData = {
			id: selectedEmployee.id,
			salaryReason: '',
			reasonComment: '',
			newSalary: '',
			changeDate: '',
			petitioner: '',
			comments: '',
			formatDate: ''
		};
	}

	onMount(() => {
		show = false;
		refetch(['employees']);
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title="Actualizar salario: {selectedEmployee.name} - {selectedEmployee.noEmpleado}"
		/>

		<DialogBody grid="1">
			<Label name="Fecha del formato">
				<Input type="date" bind:value={formData.formatDate} />
			</Label>
			<Label name="Motivo">
				<Select items={salaryReasons} bind:value={formData.salaryReason} />
			</Label>
			<Label name="Comentario (opcional)">
				<Input type="text" bind:value={formData.reasonComment} />
			</Label>
			<Label name="Fecha de modificacion">
				<Input type="date" bind:value={formData.changeDate} />
			</Label>
			<Label name="Nuevo salario">
				<Input type="number" bind:value={formData.newSalary} />
			</Label>
			<Label name="Solicitante">
				<Input type="text" bind:value={formData.petitioner} />
			</Label>
			<Label name="Observaciones">
				<Input type="text" bind:value={formData.comments} />
			</Label>
		</DialogBody>

		<DialogFooter hideFunc={() => (show = false)}>
			<Button onclick={handleSubmmit} variant="destructive">Actualizar</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
