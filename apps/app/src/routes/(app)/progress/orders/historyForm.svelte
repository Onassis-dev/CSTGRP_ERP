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
		selectedMovement: any;
		refetchFunc: () => void;
	}

	let { show = $bindable(false), selectedMovement = $bindable({}), refetchFunc }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedMovement, date: selectedMovement?.date?.split('T')[0] };
	}

	async function handleSubmit() {
		await api.put('/progress/history', {
			...formData,
			id: selectedMovement.id
		});
		refetchFunc();
		refetch(['progress-orders']);
		show = false;
		showSuccess('Movimiento editado');
	}
	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedMovement?.id ? `Editar movimiento` : 'Registrar movimiento'} />

		<DialogBody grid="1">
			<Label name="Fecha">
				<Input type="date" bind:value={formData.date} />
			</Label>
			<Label name="Cantidad">
				<Input bind:value={formData.added} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
