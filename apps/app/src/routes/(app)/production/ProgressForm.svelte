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
		area: string;
	}

	let { show = $bindable(false), selectedOrder = $bindable({}), area }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedOrder };
	}

	async function handleSubmit() {
		await api.post('/progress', {
			orderId: selectedOrder.id,
			area,
			amount: formData.newProgress
		});
		showSuccess('Progreso guardado');
		refetch(['orders', { area }]);
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
				<Input name="text" bind:value={formData.jobpo} disabled />
			</Label>
			<Label name="Parte">
				<Input name="text" bind:value={formData.part} disabled />
			</Label>
			<Label name="Cantidad" class="col-span-full">
				<Input name="text" bind:value={formData.newProgress} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
