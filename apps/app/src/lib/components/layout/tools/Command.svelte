<script lang="ts">
	import { TicketIcon } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import Conversor from './Conversor.svelte';
	import ZenpetForm from './ZenpetForm.svelte';
	import { Button } from '$lib/components/ui/button';
	import { SearchIcon } from 'lucide-svelte';

	let open = $state(false);
	let showZenpetForm = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Button
	variant="outline"
	size="action"
	onclick={() => (open = true)}
	class="flex items-center gap-2 text-sm"
>
	<SearchIcon class="size-4" />
	<span class="-mb-0.5 mr-0.5">Buscar</span>
</Button>

<Command.Dialog bind:open class="z-[51]">
	<Command.Input placeholder="Buscar..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group>
			<Command.Item
				onSelect={() => {
					showZenpetForm = true;
					open = false;
				}}
			>
				<TicketIcon class="mr-2 size-4" />
				<span>Etiquetas de Zenpet</span>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>

<Conversor />
<ZenpetForm bind:show={showZenpetForm} />
