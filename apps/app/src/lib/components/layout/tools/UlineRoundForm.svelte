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

	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();
	let formData = $state({
		year: String(new Date().getFullYear()),
		week: '',
		pages: ''
	});

	async function handleSubmit() {
		const params = new URLSearchParams(formData);
		const url = `${import.meta.env.VITE_BASEURL}/resources/tools/uline-round?${params.toString()}`;
		window.open(url, '_blank');
		show = false;
	}
</script>

<Dialog bind:open={show}>
	<DialogContent class="z-[51]">
		<DialogHeader title="Etiquetas de Uline" />

		<DialogBody grid="2">
			<Label name="Semana">
				<Input type="number" bind:value={formData.week} />
			</Label>
			<Label name="Páginas">
				<Input type="number" bind:value={formData.pages} />
			</Label>
			<Label name="Año" class="col-span-full">
				<Input type="number" bind:value={formData.year} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
