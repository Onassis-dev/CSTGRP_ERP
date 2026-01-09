<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';

	interface Props {
		value: number;
	}

	let { value = $bindable() }: Props = $props();
	let show = $state(false);
	let pallets = $state<{ shares: string }[]>([{ shares: '' }, { shares: '' }, { shares: '' }]);
	let integers = $state('0');

	function smartRound(n: number) {
		if (Number.isInteger(n)) return n;
		return Math.round(n * 10000) / 10000;
	}
</script>

<Button class="w-16 rounded-none border-none p-0" variant="outline" onclick={() => (show = true)}>
	{smartRound(value)}
</Button>

<Dialog bind:open={show}>
	<DialogContent class="sm:max-w-80">
		<DialogHeader>
			<DialogTitle>Capturar pallets</DialogTitle>
		</DialogHeader>
		<DialogBody class="h-full max-w-full" grid="1">
			<div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
				<span>Pallets completos</span>
				<Input
					bind:value={integers}
					oninput={(e) => {
						const input = e.target as HTMLInputElement;
						const digits = input.value.replace(/\D/g, '').slice(0, 2);
						input.value = digits;
						integers = digits;
					}}
				/>
			</div>
			{#each pallets as pallet, i}
				<div class="grid grid-cols-[auto_1fr_auto] items-center gap-2">
					<span>Parcial {i + 1} compartido en</span>
					<Input
						bind:value={pallet.shares}
						oninput={(e) => {
							const input = e.target as HTMLInputElement;
							const digit = input.value.replace(/[^2-9]/g, '').slice(0, 1);
							input.value = digit;
							pallet.shares = digit;
						}}
					/>
					<span>Jobs</span>
				</div>
			{/each}

			<Button
				onclick={() => {
					value = pallets
						.filter((pallet) => pallet.shares)
						.reduce((acc, pallet) => acc + 1 / Number(pallet.shares), Number(integers));
					show = false;
				}}>Calcular</Button
			>
		</DialogBody>
	</DialogContent>
</Dialog>
