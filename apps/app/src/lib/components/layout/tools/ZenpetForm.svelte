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
		const params = new URLSearchParams(formData);
		const url = `${import.meta.env.VITE_BASEURL}/resources/tools/zenpet?${params.toString()}`;
		window.open(url, '_blank');
		show = false;
	}

	const products = [
		{ name: 'Cono', value: 'cono' },
		{ name: 'Collar', value: 'collar' },
		{ name: 'Tick Tornado', value: 'tick-tornado' }
	];

	const sizes: Record<string, { name: string; value: string }[]> = {
		collar: [
			{ name: 'XXL', value: 'xxl' },
			{ name: 'XL', value: 'xl' },
			{ name: 'L', value: 'l' },
			{ name: 'M', value: 'm' },
			{ name: 'S', value: 's' },
			{ name: 'XS', value: 'xs' }
		],
		cono: [
			{ name: 'XL', value: 'xl' },
			{ name: 'L', value: 'l' },
			{ name: 'M', value: 'm' },
			{ name: 'S', value: 's' }
		],
		'tick-tornado': [
			{ name: '48', value: '48' },
			{ name: '192', value: '192' },
			{ name: '192 bilingue', value: '192b' },
			{ name: '216', value: '216' }
		]
	};

	let sizesOptions = $derived(sizes[formData.product]);
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
				<Select items={sizesOptions} bind:value={formData.size} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
