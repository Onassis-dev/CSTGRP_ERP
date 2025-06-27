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
		selectedFolder: string;
	}

	let { show = $bindable(false), selectedFolder = $bindable('') }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { name: selectedFolder };
	}

	async function handleSubmit() {
		if (selectedFolder) {
			await api.put('/resources/formats/folder', {
				oldName: selectedFolder,
				...formData
			});
			showSuccess('Carpeta editada');
		} else {
			await api.post('/resources/formats/folder', {
				...formData
			});
			showSuccess('Carpeta creada');
		}
		refetch(['formats-folders']);
		show = false;
	}

	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedFolder ? `Editar carpeta` : 'Crear carpeta'} />

		<DialogBody grid="1">
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
