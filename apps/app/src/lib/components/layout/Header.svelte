<script lang="ts">
	import { location, sidebarOpen } from './../../utils/store';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { Button } from '../ui/button';
	import { PanelRight, SearchIcon } from 'lucide-svelte';
	import { getTraduction } from './traduction';
	import Docs from './Docs.svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

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
		<Button
			variant="outline"
			size="action"
			onclick={() => (open = true)}
			class="flex items-center gap-2 text-sm"
		>
			<SearchIcon class="size-4" />
			<span class="-mb-0.5 mr-0.5">Buscar</span>
		</Button>
		<Docs />
	</div>
</header>
