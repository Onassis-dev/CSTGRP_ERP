<script lang="ts">
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
		show: boolean;
		selectedMovement: any;
	}

	let { show = $bindable(), selectedMovement }: Props = $props();

	let formData: any = $state({});

	$effect(() => {
		formData = {
			amount: selectedMovement?.amount || '',
			id: selectedMovement?.id
		};
	});

	async function submit() {
		await api.put(`/materialmovements/purchase-amount`, formData);
		refetch(['material-movements']);
		showSuccess(`Cantidad actualizada`);
		show = false;
	}
</script>

<Dialog bind:open={show}>
	<DialogContent class="sm:max-w-sm">
		<DialogHeader>
			<DialogTitle>Editar compra</DialogTitle>
		</DialogHeader>

		<DialogBody grid="1">
			<Label name="Ref">
				<Input value={selectedMovement?.ref} disabled />
			</Label>

			<Label name="Codigo">
				<Input value={selectedMovement?.code} disabled />
			</Label>

			<Label name="Cantidad">
				<Input bind:value={selectedMovement.amount} />
			</Label>

			<Button onclick={submit} variant="default" class="mt-4 w-full">Guardar cambios</Button>
		</DialogBody>
	</DialogContent>
</Dialog>
