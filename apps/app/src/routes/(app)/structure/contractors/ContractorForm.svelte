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
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	interface Props {
		show?: boolean;
		selectedPosition: any;
	}

	let { show = $bindable(false), selectedPosition = $bindable({}) }: Props = $props();
	let formData: any = $state({
		name: '',
		active: true
	});

	function setFormData() {
		formData = { ...selectedPosition };
	}

	async function handleSubmit() {
		if (selectedPosition.id) {
			await api.put('/contractors-list', formData);
			showSuccess('contratista editado');
		} else {
			await api.post('/contractors-list', formData);
			showSuccess('contratista registrado');
		}
		refetch(['structure-contractors']);
		show = false;
	}

	$effect(() => {
		if (show) setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader
			title={selectedPosition.id ? `Editar ${selectedPosition.name}` : 'Registrar contratista'}
		/>
		<DialogBody grid="2">
			<Label name="Nombre">
				<Input name="text" bind:value={formData.name} />
			</Label>
			<Label name="Activo">
				<Checkbox name="text" bind:checked={formData.active} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
