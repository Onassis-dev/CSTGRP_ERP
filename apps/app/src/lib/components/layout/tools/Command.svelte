<script lang="ts">
	import { NotebookIcon, RotateCwIcon, TicketIcon } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import Conversor from './Conversor.svelte';
	import ZenpetForm from './ZenpetForm.svelte';
	import { RulerIcon } from 'lucide-svelte';
	import Notes from '../Notes.svelte';
	import { userData } from '$lib/utils/store';
	import UlineForm from './UlineForm.svelte';
	import UlineRoundForm from './UlineRoundForm.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';

	let { open = $bindable(false) }: { open: boolean } = $props();
	let showZenpetForm = $state(false);
	let showConversor = $state(false);
	let showNotes = $state(false);
	let showUlineForm = $state(false);
	let showUlineRoundForm = $state(false);

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
			if ($userData?.permissions.directory < 1) return;
			e.preventDefault();
			open = !open;
		}
	}

	function hasAccess(name: string) {
		return ($userData?.permissions[name] || 0) > 0;
	}
</script>

<svelte:document onkeydown={handleKeydown} />

<Command.Dialog bind:open class="z-[100]">
	<Command.Input placeholder="Buscar..." />
	<Command.List>
		<Command.Empty>No se encontraron resultados</Command.Empty>
		<Command.Group>
			<Command.Item
				onSelect={() => {
					showNotes = true;
					open = false;
				}}
			>
				<NotebookIcon class="mr-2 size-4" />
				<span>Notas personales</span>
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
					showUlineForm = true;
					open = false;
				}}
			>
				<TicketIcon class="mr-2 size-4" />
				<span>Etiquetas de Uline</span>
			</Command.Item>
			<Command.Item
				onSelect={() => {
					showUlineRoundForm = true;
					open = false;
				}}
			>
				<TicketIcon class="mr-2 size-4" />
				<span>Etiquetas Redondas</span>
			</Command.Item>

			{#if hasAccess('users')}
				<Command.Item
					onSelect={async () => {
						await api.get('/inventory/recalculate');
						refetch(['inventory']);
						showSuccess('Inventario recalculado');
						open = false;
					}}
				>
					<RotateCwIcon class="mr-2 size-4" />
					<span>Recalcular inventario</span>
				</Command.Item>
			{/if}
		</Command.Group>
	</Command.List>
</Command.Dialog>

<Conversor bind:show={showConversor} />
<ZenpetForm bind:show={showZenpetForm} />
<UlineForm bind:show={showUlineForm} />
<UlineRoundForm bind:show={showUlineRoundForm} />
<Notes bind:show={showNotes} />
