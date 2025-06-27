<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import DialogTitle from './dialog-title.svelte';

	let {
		ref = $bindable(null),
		class: className,
		title,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		title?: string;
	} = $props();
</script>

<div
	bind:this={ref}
	class={cn('flex flex-col space-y-1.5 border-b p-6 pb-4 text-center sm:text-left', className)}
	{...restProps}
>
	{#if title}
		<DialogTitle>{title}</DialogTitle>
	{/if}
	{@render children?.()}
</div>
