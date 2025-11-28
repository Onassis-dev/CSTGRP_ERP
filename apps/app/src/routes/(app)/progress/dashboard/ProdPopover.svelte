<script lang="ts">
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import TableCell from '$lib/components/ui/table/table-cell.svelte';
	import { cn } from '$lib/utils';
	import { formatDate } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { Loader2 } from 'lucide-svelte';
	import { untrack } from 'svelte';

	let {
		productivity,
		date,
		day,
		areaId
	}: { productivity: number; date: string; day: number; areaId: string } = $props();
	let open = $state(false);
	let data: any = $state(null);

	function formatAvg(avg: number) {
		return (Number(avg) * 100).toFixed(2) + '%';
	}

	async function getData() {
		data = (await api.get(`/progress/orders/day?date=${date}&day=${day}&areaId=${areaId}`)).data;
	}

	$effect(() => {
		if (open && !data) untrack(getData);
	});
</script>

<TableCell class={cn('p-0', productivity >= 1 ? 'bg-green-100' : '')}>
	<Popover bind:open>
		<PopoverTrigger class="h-full w-full px-3">
			{formatAvg(productivity)}
		</PopoverTrigger>
		<PopoverContent class="w-96">
			{#if data}
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div class="font-bold">Fecha:</div>
					<div class="font-bold">Minutos:</div>
					<div>{formatDate(data.date)}</div>
					<div>{data.minutes} ({(data.minutes / 60).toFixed(2)}h)</div>
				</div>

				<div class="mt-2 grid grid-cols-4 gap-2 border-t pt-2 text-sm">
					<p class="font-bold">Job</p>
					<p class="font-bold">Operación</p>
					<p class="font-bold">Pzs</p>
					<p class="font-bold">Min</p>
					{#each data.produced as order}
						<p>{order.jobpo}</p>
						<p>{order.code}</p>
						<p>{order.added}</p>
						<p>{Number(order.workedMinutes).toFixed(2)}</p>
					{/each}
					<div class="col-span-4 border-t pt-2"></div>
					<p class="text-sm font-bold">Total</p>
					<p class="text-sm font-bold"></p>
					<p class="text-sm font-bold">
						{data.produced.reduce((acc: number, order: any) => acc + order.added, 0)}
					</p>
					<p class="text-sm font-bold">
						{data.produced
							.reduce((acc: number, order: any) => acc + Number(order.workedMinutes), 0)
							.toFixed(2)}

						({(
							data.produced.reduce(
								(acc: number, order: any) => acc + Number(order.workedMinutes),
								0
							) / 60
						).toFixed(2)}h)
					</p>
				</div>
			{:else}
				<Loader2 class="h-4 w-4 animate-spin" />
			{/if}
		</PopoverContent>
	</Popover>
</TableCell>
