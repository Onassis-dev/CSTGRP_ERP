<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
		labelClass?: string;
		name: string;
		children?: import('svelte').Snippet;
	}

	let { class: className = '', labelClass = '', name, children }: Props = $props();
</script>

<div class={cn('flex flex-col gap-1', className)}>
	<span class={cn('pl-0.5 text-xs text-[#5c5e63]', labelClass)}>
		{name}
	</span>
	{@render children?.()}
</div>
