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
	let area = $state('');

	function setFormData() {
		formData = { ...selectedMovement };
		area = selectedMovement?.corte
			? 'corte'
			: selectedMovement?.cortesVarios
				? 'cortesVarios'
				: selectedMovement?.produccion
					? 'produccion'
					: selectedMovement?.calidad
						? 'calidad'
						: 'serigrafia';
	}

	async function handleSubmit() {
		await api.put('/prod-history', {
			...formData,
			amount: formData[area],
			area
		});
		showSuccess('Movimiento editado');
		refetch(['prod-history']);
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
		<DialogHeader title={selectedMovement?.id ? `Editar movimiento` : 'Registrar movimiento'} />

		<DialogBody grid="1">
			{#if selectedMovement?.corte}
				<Label name="Corte">
					<Input name="text" bind:value={formData.corte} />
				</Label>
			{/if}
			{#if selectedMovement?.cortesVarios}
				<Label name="Cortes Varios">
					<Input name="text" bind:value={formData.cortesVarios} />
				</Label>
			{/if}
			{#if selectedMovement?.produccion}
				<Label name="Producción">
					<Input name="text" bind:value={formData.produccion} />
				</Label>
			{/if}
			{#if selectedMovement?.calidad}
				<Label name="Calidad">
					<Input name="text" bind:value={formData.calidad} />
				</Label>
			{/if}
			{#if selectedMovement?.serigrafia}
				<Label name="Serigrafía">
					<Input name="text" bind:value={formData.serigrafia} />
				</Label>
			{/if}
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
