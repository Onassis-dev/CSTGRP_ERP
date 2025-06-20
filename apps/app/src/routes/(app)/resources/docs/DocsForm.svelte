<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import Label from '$lib/components/basic/Label.svelte';
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
		<DialogHeader>
			<DialogTitle>
				{selectedRow.id ? `Editar fila` : 'Registrar fila'}
			</DialogTitle>
		</DialogHeader>

		<DialogBody>
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full gap-4">
					<Label name="Documento">
						<Input name="text" bind:value={formData.doc} />
					</Label>
					<Label name="Pagina">
						<Input name="text" bind:value={formData.page} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
