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
	import { downloadFile } from '$lib/utils/files';

	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();
	let formData: any = $state({
		startDate: '',
		endDate: ''
	});

	async function handleSubmit() {
		downloadFile({
			url: `/inventory/export-history?startDate=${formData.startDate}&endDate=${formData.endDate}`,
			name: `Inv. ${formData.startDate}.${formData.endDate}.xlsx`
		});
	}
	show = false;
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title="Exportar Historial" />
		<DialogBody grid="2">
			<Label name="Fecha Inicio">
				<Input type="date" bind:value={formData.startDate} />
			</Label>
			<Label name="Fecha Final">
				<Input type="date" bind:value={formData.endDate} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
