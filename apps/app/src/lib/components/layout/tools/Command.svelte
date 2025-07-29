<script lang="ts">
	import { TicketIcon } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import Conversor from './Conversor.svelte';
	import ZenpetForm from './ZenpetForm.svelte';
	import { RulerIcon } from 'lucide-svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();
	let showZenpetForm = $state(false);
	let showConversor = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open class="z-[100]">
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
			<Command.Item
				onSelect={() => {
					showConversor = true;
					open = false;
				}}
			>
				<RulerIcon class="mr-2 size-4" />
				<span>Convertir Medidas</span>
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>

<Conversor bind:show={showConversor} />
<ZenpetForm bind:show={showZenpetForm} />
