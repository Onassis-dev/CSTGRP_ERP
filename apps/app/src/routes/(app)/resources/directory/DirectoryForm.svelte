<script lang="ts">
	import { run, preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { onMount } from 'svelte';

	interface Props {
		show?: boolean;
		reload: any;
		selectedDevice: any;
	}

	let { show = $bindable(false), reload, selectedDevice = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedDevice };
	}

	let employees = $state([{ value: 0, name: '' }]);
	let emails = $state([{ value: 0, name: '' }]);

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/directory', {
				...formData,
				id: parseInt(formData.id || ''),
				emailId: parseInt(formData.emailId || ''),
				employeeId: parseInt(formData.employeeId || '')
			});
			showSuccess('Fila editada');
		} else {
			await api.post('/directory', {
				...formData,
				emailId: parseInt(formData.emailId || ''),
				employeeId: parseInt(formData.employeeId || '')
			});
			showSuccess('Fila registrada');
		}
		await reload();
		show = false;
	}

	onMount(async () => {
		const result = (await api.get('/directory/options')).data;
		emails = result.emails;
		employees = result.employees;
	});
	run(() => {
		if (show || true) setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>
				{selectedDevice.id ? `Editar ${selectedDevice.name}` : 'Registrar fila'}
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-2 gap-4">
					<Label name="Empleado">
						<Select items={employees} bind:value={formData.employeeId} />
					</Label>
					<Label name="Correo">
						<Select items={emails} bind:value={formData.emailId} />
					</Label>
					<Label name="Extension">
						<Input name="text" bind:value={formData.extension} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
