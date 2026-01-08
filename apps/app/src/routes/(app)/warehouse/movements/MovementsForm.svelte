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
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { Trash } from 'lucide-svelte';

	interface Props {
		show: boolean;
		selectedMovement: any;
	}

	let { show = $bindable(), selectedMovement }: Props = $props();

	let formData: any = $state({});
	let showDelete = $state(false);

	$effect(() => {
		formData = {
			date: selectedMovement?.activeDate?.split('T')[0] || '',
			id: selectedMovement?.id
		};
	});

	async function submit() {
		await api.put(`/materialmovements/date`, formData);
		show = false;
		showSuccess(`Movimiento actualizado`);
	}
</script>

<Dialog bind:open={show}>
	<DialogContent class="max-w-lg">
		<DialogHeader>
			<DialogTitle>Editar movimiento</DialogTitle>
		</DialogHeader>

		<DialogBody grid="1">
			<Label name="Ref">
				<Input value={selectedMovement?.ref} disabled />
			</Label>

			<Label name="Codigo">
				<Input value={selectedMovement?.code} disabled />
			</Label>

			<Label name="Cantidad">
				<Input value={selectedMovement?.amount} disabled />
			</Label>

			<Label name="Fecha">
				<Input type="date" bind:value={formData.date} />
			</Label>

			{#if selectedMovement?.type}
				<Button
					variant="outline"
					onclick={() => {
						show = false;
						showDelete = true;
					}}><Trash class="size-4" /> Eliminar</Button
				>
			{/if}

			<Button onclick={submit} variant="default" class="mt-4 w-full">Guardar cambios</Button>
		</DialogBody>
	</DialogContent>
</Dialog>

<DeletePopUp
	bind:show={showDelete}
	text="Eliminar movimiento"
	deleteFunc={async () => {
		await api.delete(`/materialmovements`, { data: { id: selectedMovement?.id } });
		refetch(['material-movements']);
		showDelete = false;
		showSuccess('Movimiento eliminado');
	}}
/>
