<script lang="ts">
	import { cn } from '$lib/utils.js';
	const grids = {
		'2': 'sm:grid-cols-2',
		'1': 'sm:grid-cols-1'
	};

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
		grid?: keyof typeof grids;
	}

	let { class: className = '', children, grid = undefined }: Props = $props();
</script>

<div
	class={cn(
		'grid h-full auto-rows-max items-start gap-2 overflow-auto scroll-auto p-6 py-4',
		grid ? grids[grid] : 'block',
		className
	)}
>
	{@render children?.()}
</div>
