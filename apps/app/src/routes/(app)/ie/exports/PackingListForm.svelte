<script lang="ts">
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import api from '$lib/utils/server';
	import Label from '$lib/components/basic/Label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { showSuccess } from '$lib/utils/showToast';
	import Select from '$lib/components/basic/Select.svelte';
	import { format } from 'date-fns';
	import { refetch } from '$lib/utils/query';

	interface Props {
		show: boolean;
		selectedRow: any;
	}

	let { show = $bindable(), selectedRow = $bindable() }: Props = $props();

	let data: Record<string, any> = $state({});
	let orders: Record<string, any> = $state([]);
	let options: any = $state(null);

	async function fetchData() {
		const result2 = await api.get('/ie/packing-list/options');
		options = result2.data;

		const result = (await api.get('/ie/packing-list/data?id=' + selectedRow.id)).data;
		orders = result.orders;
		console.log(result.data);
		data = {
			...result.data,
			shipDate: format(result.data.shipDate, 'yyyy-MM-dd'),
			shipVia: options.shippers.find((item: any) => item.name === result.data.shipVia)?.value,
			consignee: options.clients.find((item: any) => item.name === result.data.consignee)?.value,
			destination: options.destinations.find(
				(item: any) => item.name === result.data.destination?.name
			)?.value,
			shipTo: !data.exported
				? 1
				: options.shipTo.find((item: any) => item.name === result.data.destination?.name)?.value,
			carrierExp: options.carriers.find((item: any) => item.name === result.data.carrierExp)?.value
		};
	}

	$effect(() => {
		if (selectedRow.id) fetchData();
	});

	async function handleSubmit() {
		await api.put('/ie/packing-list', {
			...data
		});
		showSuccess('Packing list actualizado');
		show = false;
		refetch(['exports']);
	}
</script>

<Dialog bind:open={show}>
	<DialogContent class="min-h-[90dvh] ">
		<DialogHeader>
			<DialogTitle>
				{selectedRow?.so}
			</DialogTitle>
		</DialogHeader>
		<DialogBody grid="2">
			<Label name="Pack Slip">
				<Input bind:value={data.packSlip} />
			</Label>
			<Label name="Ship Via">
				<Select items={options.shippers} bind:value={data.shipVia} />
			</Label>
			<Label name="Consignee">
				<Select items={options.clients} bind:value={data.consignee} />
			</Label>
			<Label name="Ship Date">
				<Input type="date" bind:value={data.shipDate} />
			</Label>
			<Label name="B/L No">
				<Input bind:value={data.blNo} />
			</Label>
			<Label name="TRK#">
				<Input bind:value={data.trk} />
			</Label>
			<Label name="PO">
				<Input bind:value={data.po} />
			</Label>
			<Label name="Invoice">
				<Input bind:value={data.invoice} />
			</Label>
			<Label name="Weight">
				<Input bind:value={data.weight} />
			</Label>
			<Label name="Destination">
				<Select items={options.destinations} bind:value={data.destination} />
			</Label>
			<Label name="Carrier Exp">
				<Select items={options.carriers} bind:value={data.carrierExp} />
			</Label>
			<Label name="Ship To">
				<Select items={options.shipTo} bind:value={data.shipTo} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
