<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
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
	import { refetch } from '$lib/utils/query';
	import Select from '$lib/components/basic/Select.svelte';

	interface Props {
		show?: boolean;
		selectedDevice: any;
	}

	let { show = $bindable(false), selectedDevice = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = {
			...selectedDevice,
			bornDate: selectedDevice.bornDate?.split('T')[0]
		};
	}

	async function handleSubmit() {
		if (selectedDevice.id) {
			await api.put('/purchases/suppliers', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Proveedor editado');
		} else {
			await api.post('/purchases/suppliers', formData);
			showSuccess('Proveedor registrado');
		}
		refetch(['purchases-suppliers']);
		show = false;
	}
	$effect(() => {
		show;
		setFormData();
	});

	const currencies = [
		{ value: 'MXN', name: 'MXN', color: 'green' },
		{ value: 'USD', name: 'USD', color: 'blue' }
	];
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedDevice.id ? `Editar proveedor` : 'Registrar proveedor'} />

		<DialogBody grid="2">
			<Label name="Nombre" class="col-span-full">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Contacto">
				<Input name="text" bind:value={formData.atention} />
			</Label>
			<Label name="RFC">
				<Input name="text" bind:value={formData.document} />
			</Label>
			<Label name="Email">
				<Input name="text" bind:value={formData.email} />
			</Label>
			<Label name="Teléfono">
				<Input name="text" bind:value={formData.phone} />
			</Label>
			<Label name="Dirección" class="col-span-full">
				<Input name="text" bind:value={formData.direction} />
			</Label>
			<Label name="Moneda">
				<Select items={currencies} bind:value={formData.currency} />
			</Label>
			<Label name="Fecha">
				<Input bind:value={formData.bornDate} type="date" />
			</Label>
		</DialogBody>

		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
