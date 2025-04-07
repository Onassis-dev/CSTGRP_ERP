<script lang="ts">
	import { location, sidebarOpen } from './../../utils/store';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '../ui/button';
	import { PanelRight } from 'lucide-svelte';
	import { getTraduction } from './traduction';
	import { cn } from '$lib/utils';

	afterNavigate(() => {
		if (browser) {
			location.set(window?.location?.pathname);
		}
		sidebarOpen.set(false);
	});

	let traduction = $derived(getTraduction($location));
</script>

<header class="sticky flex min-h-[50px] w-full items-center border-b px-5">
	<Button class="block xl:hidden" variant="ghost" onclick={() => sidebarOpen.set(true)}>
		<PanelRight class="size-3.5" />
	</Button>
	<h3
		class={cn(
			'flex items-center gap-1.5 text-sm font-medium',
			import.meta.env.VITE_TESTING === 'true' ? 'text-red-foreground' : ''
		)}
	>
		<traduction.icon class="size-3.5" strokeWidth={1.7} />
		{traduction.text}
	</h3>
</header>
