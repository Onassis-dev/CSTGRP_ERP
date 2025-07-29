<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { onMount, untrack } from 'svelte';
	import Select from '../../basic/Select.svelte';
	import { Input } from '../../ui/input';
	import Button from '../../ui/button/button.svelte';
	import { Copy } from 'lucide-svelte';

	let open = $state(false);

	const measurements = [
		{
			name: 'Metro',
			value: 'Metro'
		},
		{
			name: 'Pulgada',
			value: 'Pulgada'
		},
		{
			name: 'Pie',
			value: 'Pie'
		},
		{
			name: 'Yarda',
			value: 'Yarda'
		}
	];

	const convert = () => {
		if (!from || !to || !amount) {
			result = 0;
			return;
		}

		// Convert everything to meters first
		let inMeters = amount;
		if (from === 'Pulgada') {
			inMeters = amount * 0.0254;
		} else if (from === 'Pie') {
			inMeters = amount * 0.3048;
		} else if (from === 'Yarda') {
			inMeters = amount * 0.9144;
		}

		let baseResult = 0;

		// Convert from meters to target unit
		if (to === 'Metro') {
			baseResult = inMeters;
		} else if (to === 'Pulgada') {
			baseResult = inMeters / 0.0254;
		} else if (to === 'Pie') {
			baseResult = inMeters / 0.3048;
		} else if (to === 'Yarda') {
			baseResult = inMeters / 0.9144;
		}

		// Round to 2 decimal places for better readability
		result = Math.round(baseResult * 100) / 100;
	};

	let amount = $state(0);
	let result = $state(0);
	let from = $state('');
	let to = $state('');

	$effect(() => {
		convert();
	});
</script>

{#if open}
	<Card
		class="absolute right-5 top-5 z-[51] grid grid-cols-2 grid-rows-[auto_auto_auto] gap-2 p-2 shadow-md"
	>
		<p class="col-span-2 text-center text-sm font-semibold">Convertir</p>
		<Input type="number" bind:value={amount} class="max-w-36" placeholder="de"></Input>
		<p
			class=" flex max-w-36 items-center justify-between gap-2 rounded-sm px-3 text-sm font-medium"
		>
			{result}
			<Button
				variant="ghost"
				size="icon"
				onclick={() => navigator.clipboard.writeText(result.toString())}
			>
				<Copy class="size-3.5" />
			</Button>
		</p>
		<Select items={measurements} bind:value={from} class="max-w-36" placeholder="de"></Select>
		<Select items={measurements} bind:value={to} class="max-w-36" placeholder="a"></Select>
	</Card>
{/if}
