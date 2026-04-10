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
	import { untrack } from 'svelte';

	interface Props {
		show?: boolean;
		selectedMovement: any;
	}

	let { show = $bindable(false), selectedMovement = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		formData = { ...selectedMovement };
	}

	async function handleSubmit() {
		await api.put('/contractors/deliveries/approve', {
			...formData
		});
		showSuccess('Entrega editada');
		refetch(['contractors-deliveries']);
		show = false;
	}
	$effect(() => {
		show;
		setFormData();
		untrack(() => console.log(formData));
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={'Confirmar entrega'} />

		<DialogBody grid="1">
			<Label name="Rechazado">
				<Input bind:value={formData.rejected} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
