<script lang="ts">
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		chevron = true,
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & { chevron?: boolean } = $props();
</script>

<SelectPrimitive.Trigger
	bind:ref
	class={cn(
		'flex h-8 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring  disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
		className
	)}
	{...restProps}
>
	{@render children?.()}
	{#if chevron}
		<ChevronDown class="size-3.5 opacity-50" />
	{/if}
</SelectPrimitive.Trigger>
