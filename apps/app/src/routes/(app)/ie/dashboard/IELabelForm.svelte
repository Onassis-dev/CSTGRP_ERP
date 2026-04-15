<script lang="ts">
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import Label from '$lib/components/basic/Label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Select from '$lib/components/basic/Select.svelte';

	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();

	let destinations: any[] = $state([]);
	let clients: any[] = $state([]);

	const emptyData = {
		client: '',
		destination: '',
		ps: '',
		po: '',
		so: '',
		pallets: 0,
		date: ''
	};

	let formData: any = $state(emptyData);

	const fetchDestinations = async () => {
		destinations = (await api.get('/inventoryvarious/destinations')).data;
	};

	const fetchClients = async () => {
		clients = (await api.get('/inventoryvarious/clients')).data;
	};

	async function handleSubmit() {
		const params = new URLSearchParams(formData);
		window.open(
			`${import.meta.env.VITE_BASEURL}/resources/tools/ielabels?${params.toString()}`,
			'_blank'
		);
	}

	$effect(() => {
		if (show) fetchDestinations();
		if (show) fetchClients();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="z-[51]">
		<DialogHeader title="Etiquetas de Uline" />

		<DialogBody grid="2">
			<Label name="Cliente:">
				<Select items={clients} bind:value={formData.client} />
			</Label>
			<Label name="Fecha:">
				<Input type="date" bind:value={formData.date} />
			</Label>
			<Label name="Destino:" class="col-span-full">
				<Select items={destinations} bind:value={formData.destination} />
			</Label>
			<Label name="PS:">
				<Input bind:value={formData.ps} />
			</Label>
			<Label name="PO:">
				<Input bind:value={formData.po} />
			</Label>
			<Label name="SO:">
				<Input bind:value={formData.so} />
			</Label>
			<Label name="Pallets:">
				<Input bind:value={formData.pallets} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
