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
	import { onMount } from 'svelte';
	import { quitReasons, quitStatus } from './employees.options';
	import Label from '$lib/components/basic/Label.svelte';

	interface Props {
		show?: boolean;
		selectedEmployee: any;
	}

	let { show = $bindable(false), selectedEmployee = $bindable({}) }: Props = $props();

	let formData: any = $state({
		id: selectedEmployee.id,
		quitReason: null,
		quitDate: '',
		quitNotes: '',
		quitStatus: '',
		resignationDate: '',
		lastDay: '',
		formatDate: ''
	});

	async function handleSubmmit() {
		await api.delete('/employees', {
			data: { ...formData, id: parseInt(selectedEmployee.id || '0') }
		});

		show = false;
		showSuccess('Empleado dado de baja');
		formData = {
			id: '',
			quitReason: null,
			quitDate: '',
			quitNotes: '',
			quitStatus: '',
			resignationDate: '',
			lastDay: '',
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
		<DialogHeader title="Dar de baja a: {selectedEmployee.name} - {selectedEmployee.noEmpleado}" />
		<DialogBody grid="1">
			<Label name="Fecha del formato">
				<Input type="date" bind:value={formData.formatDate} />
			</Label>
			<Label name="Razon">
				<Select items={quitReasons} bind:value={formData.quitReason} />
			</Label>
			<Label name="Fecha de baja">
				<Input type="date" bind:value={formData.quitDate} />
			</Label>
			<Label name="Fecha de renuncia">
				<Input type="date" bind:value={formData.resignationDate} />
			</Label>
			<Label name="Ultimo dia">
				<Input type="date" bind:value={formData.lastDay} />
			</Label>
			<Label name="Status">
				<Select items={quitStatus} bind:value={formData.quitStatus} />
			</Label>
			<Label name="Notas">
				<Input bind:value={formData.quitNotes} />
			</Label>
		</DialogBody>
		<DialogFooter hideFunc={() => (show = false)}>
			<Button onclick={handleSubmmit} variant="destructive">Dar de baja</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
