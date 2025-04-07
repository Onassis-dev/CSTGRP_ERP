<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';

	import api from '$lib/utils/server';
	import { preventDefault } from 'svelte/legacy';

	interface Props {
		show: boolean;
		selectedJob: any;
		reload: () => void;
	}

	let { show = $bindable(), selectedJob = $bindable({}), reload }: Props = $props();
	let formData: any = $state({});

	const options = [
		{ name: 'Cortes Varios', value: 'cortesVarios' },
		{ name: 'Corte', value: 'corte' },
		{ name: 'Producción', value: 'produccion' },
		{ name: 'Exportación', value: 'exportacion' },
		{ name: 'Calidad', value: 'calidad' },
		{ name: 'Serigrafía', value: 'serigrafia' }
	];

	async function handleSubmit() {
		await api.post('/orders/progress', {
			progressId: selectedJob.id,
			[formData.selected]: formData.amount
		});
		show = false;
		reload();
	}
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid grid-rows-[auto_1fr] gap-4">
		<DialogHeader>
			<DialogTitle>
				{selectedJob.jobpo} - {selectedJob.part}
			</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full">
			<form onsubmit={preventDefault(handleSubmit)}>
				<div class="grid w-full grid-cols-1 gap-4">
					<Label name="Parte">
						<Select items={options} bind:value={formData.selected} />
					</Label>
					<Label name="Cantidad">
						<Input bind:value={formData.amount} />
					</Label>
				</div>

				<Button type="submit" class="mt-4 w-full">Guardar cambios</Button>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
