<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
	import { Button } from '$lib/components/ui/button';
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
		selectedRow: any;
	}

	let { show = $bindable(false), selectedRow = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedRow };
	}

	async function handleSubmit() {
		if (selectedRow.id) {
			await api.put('/resources/docs', {
				...formData,
				id: parseInt(formData.id || '')
			});
			showSuccess('Fila editada');
		} else {
			await api.post('/resources/docs', {
				...formData
			});
			showSuccess('Fila registrada');
		}
		refetch(['docs']);
		show = false;
	}

	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedRow.id ? `Editar fila` : 'Registrar fila'} />

		<DialogBody grid="1">
			<Label name="Documento">
				<Input name="text" bind:value={formData.doc} />
			</Label>
			<Label name="Pagina">
				<Input name="text" bind:value={formData.page} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
