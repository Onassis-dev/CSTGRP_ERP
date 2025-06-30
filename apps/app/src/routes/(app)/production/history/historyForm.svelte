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
		selectedEmail: any;
	}

	let { show = $bindable(false), selectedEmail = $bindable({}) }: Props = $props();
	let formData: any = $state();
	let area = $state('');

	function setFormData() {
		formData = { ...selectedEmail };
		area = selectedEmail.corte
			? 'corte'
			: selectedEmail.cortesVarios
				? 'cortesVarios'
				: selectedEmail.produccion
					? 'produccion'
					: selectedEmail.calidad
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
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={selectedEmail.id ? `Editar movimiento` : 'Registrar movimiento'} />

		<DialogBody grid="1">
			<Label name="Jobpo">
				<Input name="text" bind:value={formData.jobpo} disabled />
			</Label>
			{#if selectedEmail.corte}
				<Label name="Corte">
					<Input name="text" bind:value={formData.corte} />
				</Label>
			{/if}
			{#if selectedEmail.cortesVarios}
				<Label name="Cortes Varios">
					<Input name="text" bind:value={formData.cortesVarios} />
				</Label>
			{/if}
			{#if selectedEmail.produccion}
				<Label name="Producción">
					<Input name="text" bind:value={formData.produccion} />
				</Label>
			{/if}
			{#if selectedEmail.calidad}
				<Label name="Calidad">
					<Input name="text" bind:value={formData.calidad} />
				</Label>
			{/if}
			{#if selectedEmail.serigrafia}
				<Label name="Serigrafía">
					<Input name="text" bind:value={formData.serigrafia} />
				</Label>
			{/if}
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
