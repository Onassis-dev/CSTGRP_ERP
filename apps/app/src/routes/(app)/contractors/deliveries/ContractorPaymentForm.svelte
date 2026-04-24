<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Label from '$lib/components/basic/Label.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHeader, TableRow } from '$lib/components/ui/table';
	import TableHead from '$lib/components/ui/table/table-head.svelte';
	import { formatDate } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { showError } from '$lib/utils/showToast';

	type DeliveryForPayment = {
		rejected: unknown;
		accepted: unknown;
		date: string;
		ref: unknown;
		contractor: unknown;
		id: number;
	};

	type DeliveryRow = DeliveryForPayment & { selected: boolean };

	interface Props {
		show?: boolean;
	}

	let formData = $state({
		startDate: '',
		endDate: ''
	});

	let deliveries = $state<DeliveryRow[]>([]);

	let { show = $bindable(false) }: Props = $props();

	async function handleSubmit() {
		const ids = deliveries.filter((d) => d.selected).map((d) => d.id);
		if (ids.length === 0) {
			showError(null, 'Selecciona al menos una entrega');
			return;
		}
		window.open(
			`${import.meta.env.VITE_BASEURL}/contractors/payments/download?deliveriesId=${ids.join(',')}`,
			'_blank'
		);
	}

	async function getDeliveries() {
		const result = await api.get('/contractors/payments/deliveries-for-payment', {
			params: formData
		});
		deliveries = result.data.map((d: DeliveryForPayment) => ({ ...d, selected: false }));
	}

	$effect(() => {
		if (formData.startDate && formData.endDate) {
			getDeliveries();
		}
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader title={'Confirmar entrega'} />

		<DialogBody grid="2">
			<Label name="Inicio">
				<Input type="date" bind:value={formData.startDate} />
			</Label>
			<Label name="Fin">
				<Input type="date" bind:value={formData.endDate} />
			</Label>
			<div class="col-span-2 max-h-80">
				<CusTable>
					<TableHeader class="border-t">
						<TableHead>Rechazado</TableHead>
						<TableHead>Aceptado</TableHead>
						<TableHead>Fecha</TableHead>
						<TableHead>Ref</TableHead>
						<TableHead class="w-full">Contratista</TableHead>
						<TableHead class="w-1 p-0 text-center" />
					</TableHeader>
					<TableBody>
						{#each deliveries as delivery (delivery.id)}
							<TableRow>
								<TableCell>{delivery.rejected ?? ''}</TableCell>
								<TableCell>{delivery.accepted ?? ''}</TableCell>
								<TableCell>{formatDate(delivery.date)}</TableCell>
								<TableCell>{delivery.ref ?? ''}</TableCell>
								<TableCell>{delivery.contractor ?? ''}</TableCell>
								<TableCell class="w-1 p-0 text-center">
									<Checkbox class="mx-auto" bind:checked={delivery.selected} />
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</CusTable>
			</div>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
