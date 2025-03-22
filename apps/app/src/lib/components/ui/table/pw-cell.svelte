<script lang="ts">
	import type { HTMLTdAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

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
	class={cn('h-[35px] border-r px-3 align-middle', className)}
	{...rest}
	onclick={() => (show = !show)}
>
	{#if password}
		{#if show}
			{password}
		{:else}
			<span class="text-sm">●●●●●●●●●●●●●●●</span>
		{/if}
	{/if}
</td>
