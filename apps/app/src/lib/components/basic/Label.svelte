<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		name: string;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', name, children }: Props = $props();
</script>

<div class={cn('flex flex-col gap-1', className)}>
	<span class="pl-0.5 text-xs text-[#5c5e63]">
		{name}
	</span>
	{@render children?.()}
</div>
