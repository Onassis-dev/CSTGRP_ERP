<script lang="ts">
	import { getTraduction } from '$lib/components/layout/traduction';
	import { cn } from '$lib/utils.js';
	import { location } from '$lib/utils/store';

	interface Props {
		class?: string;
		href?: string;
	}

	let { class: className = '', href = '' }: Props = $props();
	let active = $derived(href === $location);

	let traduction = getTraduction(href);
</script>

<a {href} class={cn(' relative flex h-7 items-center text-sm', className)}>
	<span
		class={cn(
			'hover:bg-muted flex h-full w-full items-center rounded-sm p-2',
			active ? 'bg-muted' : ''
		)}
	>
		<span class="flex items-center gap-2">
			{traduction.text}
		</span>
	</span>
</a>
