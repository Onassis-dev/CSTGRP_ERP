<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { HelpCircle } from 'lucide-svelte';
	import { Button } from '../ui/button';
	import api from '$lib/utils/server';
	import { location } from '$lib/utils/store';

	let docsPath = $state(null);

	$effect(() => {
		api
			.get('/resources/docs/one', { params: { page: $location } })
			.then(({ data }) => (docsPath = data))
			.catch(() => (docsPath = null));
	});

	$inspect(docsPath);
	$inspect($location);
</script>

<Dialog.Root>
	<Dialog.Trigger class="ml-auto">
		<Button variant="ghost" size="icon">
			<HelpCircle class="size-3.5" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="h-[90dvh] max-h-[90dvh] w-[90dvw] max-w-[90dvw] overflow-hidden">
		<iframe src={docsPath} class="h-full w-full" title="Docs"></iframe>
	</Dialog.Content>
</Dialog.Root>
