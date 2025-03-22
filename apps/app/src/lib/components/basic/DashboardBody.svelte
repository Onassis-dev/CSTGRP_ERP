<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import DashboardHeader from './DashboardHeader.svelte';

	let { class: className, children, title }: HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class="flex-1 overflow-auto">
	<DashboardHeader>{title}</DashboardHeader>

	<div class={cn('p-5', className)}>
		{@render children?.()}
	</div>
</div>
