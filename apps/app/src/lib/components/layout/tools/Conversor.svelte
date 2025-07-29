<script lang="ts">
	import Select from '../../basic/Select.svelte';
	import { Input } from '../../ui/input';
	import Button from '../../ui/button/button.svelte';
	import { Copy } from 'lucide-svelte';
	import { Dialog, DialogBody, DialogContent, DialogHeader } from '$lib/components/ui/dialog';
	import Label from '../../basic/Label.svelte';
	import { showSuccess } from '$lib/utils/showToast';

	interface Props {
		show?: boolean;
	}

	let { show = $bindable(false) }: Props = $props();

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

<Dialog bind:open={show}>
	<DialogContent class="z-[51] h-[80vh] sm:max-w-sm">
		<DialogHeader title="Convertir Medidas" />

		<DialogBody grid="1">
			<Label name="Cantidad" class="col-span-full">
				<Input type="number" bind:value={amount} placeholder="Ingrese cantidad" />
			</Label>
			<Label name="De">
				<Select items={measurements} bind:value={from} placeholder="Seleccionar unidad" />
			</Label>
			<Label name="A">
				<Select items={measurements} bind:value={to} placeholder="Seleccionar unidad" />
			</Label>
			<Label name="Resultado" class="col-span-full">
				<div
					class="flex items-center justify-between gap-2 rounded-sm border px-3 py-2 text-sm font-medium"
				>
					<span>{result}</span>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => {
							navigator.clipboard.writeText(result.toString());
							showSuccess('Copiado');
						}}
					>
						<Copy class="size-3.5" />
					</Button>
				</div>
			</Label>
		</DialogBody>
	</DialogContent>
</Dialog>
