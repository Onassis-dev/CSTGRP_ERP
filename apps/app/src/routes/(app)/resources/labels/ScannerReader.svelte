<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import { QrCode } from 'lucide-svelte';

	let scannedCode = $state('');
	let debounceTimer: any = $state(null);
	let showGreen = $state(false);
	let inputValue = $state('');

	const debounce = (v: string) => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			scannedCode = v;
			inputValue = '';
			showGreen = true;
			setTimeout(() => {
				showGreen = false;
			}, 400);
		}, 150);
	};
</script>

<div class="flex items-center gap-2">
	<label class="relative size-8">
		<Input
			class="size-8 cursor-pointer caret-transparent"
			oninput={(e) => {
				inputValue += (e.target as HTMLInputElement).value;
				(e.target as HTMLInputElement).value = '';
				debounce(inputValue);
			}}
		/>
		<QrCode class="absolute right-1/2 top-1/2 -translate-y-1/2 translate-x-1/2" />
	</label>
	<p class={cn('w-8 cursor-pointer', showGreen ? 'text-red-500' : '')}>{scannedCode}</p>
</div>
