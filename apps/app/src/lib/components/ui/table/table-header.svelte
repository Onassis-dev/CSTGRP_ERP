<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLTableSectionElement>> = $props();
</script>

<thead
	bind:this={ref}
	class={cn(
		'outline-border sticky top-0 z-20 w-full bg-white text-sm outline outline-1',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</thead>
