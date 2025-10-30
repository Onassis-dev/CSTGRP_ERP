<script lang="ts">
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { formatDate } from '$lib/utils/functions';
	import Label from '$lib/components/basic/Label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { showSuccess } from '$lib/utils/showToast';

	interface Props {
		show: boolean;
		selectedRow: any;
	}

	let { show = $bindable(), selectedRow = $bindable() }: Props = $props();

	let data: Record<string, any> = $state({});
	let orders: Record<string, any> = $state([]);
	let options: any = $state(null);

	async function fetchData() {
		const result = (await api.get('/ie/packing-list/data?id=' + selectedRow.id)).data;
		orders = result.orders;
		data = result.data;

		const result2 = await api.get('/ie/packing-list/options');
		options = result2.data;

		console.log(data);
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
			<Label name="Pack Slip" class="col-span-2">
				<Input bind:value={data.packSlip} />
			</Label>
			<Label name="Ship Via">
				<Input bind:value={data.shipVia} />
			</Label>
			<Label name="Consignee">
				<Input bind:value={data.consignee} />
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
				<Input bind:value={data.destination} />
			</Label>
			<Label name="Carrier Exp">
				<Input bind:value={data.carrierExp} />
			</Label>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
