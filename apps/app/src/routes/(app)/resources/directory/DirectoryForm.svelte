<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { onMount } from 'svelte';
	import { refetch } from '$lib/utils/query';

	interface Props {
		show?: boolean;
		selectedRow: any;
	}

	let { show = $bindable(false), selectedRow = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedRow };
	}

	let employees = $state([{ value: 0, name: '' }]);
	let emails = $state([{ value: 0, name: '' }]);

	async function handleSubmit() {
		if (selectedRow.id) {
			await api.put('/resources/directory', {
				...formData,
				id: parseInt(formData.id || ''),
				emailId: parseInt(formData.emailId || '')
			});
			showSuccess('Fila editada');
		} else {
			await api.post('/resources/directory', {
				...formData,
				emailId: parseInt(formData.emailId || '')
			});
			showSuccess('Fila registrada');
		}
		refetch(['directory']);
		show = false;
	}

	onMount(async () => {
		const result = (await api.get('/resources/directory/options')).data;
		emails = result.emails;
		employees = result.employees;
	});
	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedRow.id ? `Editar ${selectedRow.name}` : 'Registrar fila'} />

		<DialogBody grid="2">
			<Label name="Empleado">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Posicion">
				<Input name="text" bind:value={formData.position} />
			</Label>
			<Label name="Correo">
				<Select items={emails} bind:value={formData.emailId} />
			</Label>
			<Label name="Extension">
				<Input name="text" bind:value={formData.extension} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
