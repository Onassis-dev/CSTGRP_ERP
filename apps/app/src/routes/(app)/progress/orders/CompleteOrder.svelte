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
	import { refetch } from '$lib/utils/query';

	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';

	interface Props {
		show?: boolean;
		selectedOrder: any;
		reload: () => void;
	}

	let { show = $bindable(false), selectedOrder = $bindable({}), reload }: Props = $props();
	let data: any = $state();
	let formData: any = $state({});
	let disabled: boolean = $state(false);

	$effect(() => {
		data = { ...selectedOrder };
		formData = { date: new Date().toISOString().split('T')[0] };
	});

	async function handleSubmit() {
		disabled = true;
		try {
			await api.post('/progress/history/complete', {
				id: data.id,
				date: formData.date
			});
		} finally {
			disabled = false;
		}
		refetch(['progress-orders']);
		reload();
		show = false;
		disabled = false;
		showSuccess('Orden completada');
	}
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={data?.ref} />

		<DialogBody grid="2">
			<Label name="Fecha" class="col-span-full">
				<Input type="date" bind:value={formData.date} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} {disabled} />
	</DialogContent>
</Dialog>
