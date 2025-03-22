<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let { class: className, children }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn('px-5 pt-3 text-xl font-semibold', className)}>
	{@render children?.()}
</div>
