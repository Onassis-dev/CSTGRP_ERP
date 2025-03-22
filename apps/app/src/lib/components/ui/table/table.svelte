<script lang="ts">
	import type { HTMLTableAttributes } from 'svelte/elements';
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		divClass,
		...restProps
	}: WithElementRef<HTMLTableAttributes> & { divClass?: string } = $props();
</script>

<div class={cn('relative w-full overflow-auto', divClass)}>
	<table bind:this={ref} class={cn('w-full caption-bottom text-sm', className)} {...restProps}>
		{@render children?.()}
	</table>
</div>
