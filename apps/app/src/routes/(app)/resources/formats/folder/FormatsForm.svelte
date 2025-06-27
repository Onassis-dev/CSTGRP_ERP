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
		selectedFormat: string;
		selectedFolder: string;
	}

	let { show = $bindable(false), selectedFormat = $bindable(''), selectedFolder }: Props = $props();
	let files = $state<FileList | undefined>();
	let formData: any = $state();

	function setFormData() {
		formData = { name: selectedFormat, folder: selectedFolder };
	}

	async function handleSubmit() {
		const form = new FormData();

		if (files) form.append('file', files[0]);
		form.append('name', formData.name.split('.')[0]);
		form.append('folder', selectedFolder);
		form.append('oldName', selectedFormat);

		if (selectedFormat) {
			await api.put('/resources/formats', form);
			showSuccess('Archivo editado');
		} else {
			await api.post('/resources/formats', form);
			showSuccess('Archivo subido');
		}
		refetch(['formats', selectedFolder]);
		show = false;
	}

	$effect(() => {
		if (!show) files = undefined;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedFormat ? `Editar archivo` : 'Crear archivo'} />

		<DialogBody grid="1">
			<Label name="Archivo">
				<Input
					type="file"
					bind:files
					accept=".pdf"
					onchange={(e) => {
						const file = (e.target as HTMLInputElement)?.files?.[0];
						if (!selectedFormat && file?.name) {
							formData.name = file.name.split('.')[0];
						}
					}}
				/>
			</Label>
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
