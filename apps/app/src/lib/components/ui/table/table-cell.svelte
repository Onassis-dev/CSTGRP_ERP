<script lang="ts">
	import type { HTMLTdAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTdAttributes> = $props();
</script>

<td
	bind:this={ref}
	class={cn('h-[35px] whitespace-nowrap border-r px-3 py-0 align-middle', className)}
	{...restProps}
>
	{@render children?.()}
</td>
