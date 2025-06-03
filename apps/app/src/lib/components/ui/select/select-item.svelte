<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { Select as SelectPrimitive, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: childrenProp,
		color,
		variants = {},
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> & { variants?: Record<string, string> } = $props();
</script>

<SelectPrimitive.Item
	bind:ref
	{value}
	class={cn(
		'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground hover:bg-accent/50 relative flex w-full cursor-pointer select-none items-center rounded-sm py-1 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		color ? 'pl-6' : 'pl-2',
		className
	)}
	{...restProps}
>
	{#snippet children({ selected, highlighted })}
		{#if childrenProp}
			{@render childrenProp({ selected, highlighted })}
		{:else}
			{label || value}
		{/if}

		{#if color}
			<span class="absolute left-2 flex items-center justify-center">
				<div class={cn('size-2 rounded-full', variants[color])}></div>
			</span>
		{/if}

		<span class="absolute right-2 flex size-3.5 items-center justify-center">
			{#if selected}
				<Check class="size-3.5" />
			{/if}
		</span>
	{/snippet}
</SelectPrimitive.Item>
