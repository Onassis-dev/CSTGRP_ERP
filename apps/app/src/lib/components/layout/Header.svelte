<script lang="ts">
	import { location, sidebarOpen } from './../../utils/store';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '../ui/button';
	import { PanelRight } from 'lucide-svelte';
	import { getTraduction } from './traduction';
	import Docs from './Docs.svelte';
	import Command from './tools/Command.svelte';

	afterNavigate(() => {
		if (browser) {
			location.set(window?.location?.pathname);
		}
		sidebarOpen.set(false);
	});

	let traduction = $derived(getTraduction($location));
</script>

<header class="sticky flex min-h-[50px] w-full items-center border-b px-3">
	<Button class="block xl:hidden" variant="ghost" onclick={() => sidebarOpen.set(true)}>
		<PanelRight class="size-3.5" />
	</Button>
	<h3 class="flex items-center gap-1.5 text-sm font-medium">
		<traduction.icon class="size-3.5" strokeWidth={1.8} />
		{traduction.text}
	</h3>

	<div class="ml-auto flex items-center gap-2">
		<Command />
		<Docs />
	</div>
</header>
