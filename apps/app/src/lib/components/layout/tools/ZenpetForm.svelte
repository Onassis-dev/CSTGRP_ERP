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
	import Select from '$lib/components/basic/Select.svelte';

	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();
	let formData = $state({
		date: '',
		start: '',
		end: '',
		product: '',
		size: ''
	});

	async function handleSubmit() {
		const response = await api.post('/resources/tools/zenpet', formData, {
			responseType: 'arraybuffer'
		});
		// show = false;

		const blob = new Blob([response.data], { type: 'application/pdf' });
		const url = URL.createObjectURL(blob);
		window.open(url, '_blank');
	}

	const products = [
		{ name: 'Cono', value: 'cono' },
		{ name: 'Collar', value: 'collar' }
	];

	const sizes = [
		{ name: 'XXL', value: 'xxl' },
		{ name: 'XL', value: 'xl' },
		{ name: 'L', value: 'l' },
		{ name: 'M', value: 'm' },
		{ name: 'S', value: 's' },
		{ name: 'XS', value: 'xs' }
	];
</script>

<Dialog bind:open={show}>
	<DialogContent class="z-[51]">
		<DialogHeader title="Etiquetas de Zenpet" />

		<DialogBody grid="2">
			<Label name="Fecha" class="col-span-full">
				<Input type="date" bind:value={formData.date} />
			</Label>
			<Label name="Inicio">
				<Input type="number" bind:value={formData.start} />
			</Label>
			<Label name="Final">
				<Input type="number" bind:value={formData.end} />
			</Label>
			<Label name="Producto">
				<Select items={products} bind:value={formData.product} />
			</Label>
			<Label name="Talla">
				<Select items={sizes} bind:value={formData.size} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
