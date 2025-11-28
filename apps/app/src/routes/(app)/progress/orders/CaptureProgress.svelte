<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';

	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';

	interface Props {
		show?: boolean;
		selectedOperation: any;
		reload: () => void;
	}

	let { show = $bindable(false), selectedOperation = $bindable({}), reload }: Props = $props();
	let data: any = $state();
	let formData: any = $state({});

	$effect(() => {
		data = { ...selectedOperation };
		formData = { date: new Date().toISOString().split('T')[0] };
	});

	async function handleSubmit() {
		await api.post('/progress/history', {
			operationId: data.id,
			added: formData.added,
			date: formData.date
		});
		reload();
		show = false;
		showSuccess('Progreso capturado');
	}
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={data?.code} />

		<DialogBody grid="2">
			<Label name="Fecha" class="col-span-full">
				<Input type="date" bind:value={formData.date} />
			</Label>
			<Label name="Cantidad" class="col-span-full">
				<Input bind:value={formData.added} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
