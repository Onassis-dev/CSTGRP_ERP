<script lang="ts">
	import { cn } from '$lib/utils.js';
	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<div class={cn('max-h-[85lvh] overflow-auto scroll-auto border-t p-6', className)}>
	{@render children?.()}
</div>
