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

	interface Props {
		show?: boolean;
		selectedOrder: any;
	}

	let { show = $bindable(false), selectedOrder = $bindable({}) }: Props = $props();
	let formData: any = $state();
	let disabled: boolean = $state(false);

	function setFormData() {
		formData = { ...selectedOrder };
	}

	async function handleSubmit() {
		disabled = true;
		try {
			await api.post('/contractors/progress', {
				orderId: selectedOrder.id,
				amount: formData.newProgress,
				date: formData.date
			});
		} finally {
			disabled = false;
		}
		showSuccess('Progreso guardado');
		refetch(['contractors-orders']);
		show = false;
		selectedOrder = null;
	}

	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title="Agregar progreso" />

		<DialogBody grid="2">
			<Label name="Job/PO">
				<Input bind:value={formData.ref} disabled />
			</Label>
			<Label name="Parte">
				<Input bind:value={formData.part} disabled />
			</Label>
			<Label name="Fecha" class="col-span-full">
				<Input type="date" bind:value={formData.date} />
			</Label>
			<Label name="Cantidad" class="col-span-full">
				<Input bind:value={formData.newProgress} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} {disabled} />
	</DialogContent>
</Dialog>
