<script lang="ts">
	import type { HTMLTdAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import { CopyIcon } from 'lucide-svelte';
	import { showSuccess } from '$lib/utils/showToast';

	type $$Props = HTMLTdAttributes & {
		password?: string;
	};

	interface Props {
		class?: $$Props['class'];
		password?: string;
		[key: string]: any;
	}

	let { class: className = undefined, password = '', ...rest }: Props = $props();

	let show = $state(false);
</script>

<td
	class={cn(
		'flex h-[35px] items-center justify-center gap-2 border-r px-3 align-middle',
		className
	)}
	{...rest}
	onclick={() => (show = !show)}
>
	{#if password}
		<button
			class="flex h-full w-full items-center justify-center"
			onclick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				navigator.clipboard.writeText(password);
				showSuccess('Copiado');
			}}
		>
			<CopyIcon class="h-4 w-4" />
		</button>
		{#if show}
			{password}
		{:else}
			<span class="text-sm">●●●●●●●●●</span>
		{/if}
	{/if}
</td>
