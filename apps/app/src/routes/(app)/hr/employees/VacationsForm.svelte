<script lang="ts">
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
	import { onMount } from 'svelte';
	import Label from '$lib/components/basic/Label.svelte';

	interface Props {
		show?: boolean;
		selectedEmployee: any;
	}

	let { show = $bindable(false), selectedEmployee = $bindable({}) }: Props = $props();

	let formData = $state({
		employeeId: selectedEmployee.id,
		startDate: '',
		endDate: '',
		days: '',
		notes: ''
	});

	async function handleSubmmit() {
		await api.post('/employees/vacations', {
			...formData,
			employeeId: Number(selectedEmployee.id || '0'),
			days: Number(formData.days || '0'),
			notes: formData.notes || null
		});

		show = false;
		showSuccess('Vacaciones registradas');
		formData = {
			employeeId: selectedEmployee.id,
			startDate: '',
			endDate: '',
			days: '',
			notes: ''
		};
	}

	onMount(() => {
		show = false;
		refetch(['employees']);
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title="Vacaciones de: {selectedEmployee.name} - {selectedEmployee.noEmpleado}" />
		<DialogBody grid="1">
			<Label name="Fecha de inicio">
				<Input type="date" bind:value={formData.startDate} />
			</Label>
			<Label name="Fecha de fin">
				<Input type="date" bind:value={formData.endDate} />
			</Label>
			<Label name="Dias">
				<Input type="number" bind:value={formData.days} />
			</Label>
			<Label name="Notas">
				<Input bind:value={formData.notes} />
			</Label>
		</DialogBody>
		<DialogFooter hideFunc={() => (show = false)}>
			<Button onclick={handleSubmmit}>Guardar vacaciones</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
