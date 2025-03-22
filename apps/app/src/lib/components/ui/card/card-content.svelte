<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		card = false,
		chart = false,
		...restProps
	}: WithElementRef<
		HTMLAttributes<HTMLDivElement> & { card?: boolean; chart?: boolean }
	> = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		' px-4 py-3',
		card ? '[&_tr:last-child]:border-0' : '',
		chart ? 'h-full' : '',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
