<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Check, NotepadText, Trash, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { Button } from '../ui/button';
	import { Input } from '../ui/input';
	import { Textarea } from '../ui/textarea';
	import api from '$lib/utils/server';

	type Note = {
		id: number;
		title: string;
		content: string;
	};

	let notes = $state<Note[]>([]);

	const getNotes = async () => {
		const response = await api.get('/notes');
		notes = response.data;
	};

	const createNote = async () => {
		const response = await api.post('/notes', { title: newNote.title, content: ' ' });
		notes = response.data;
		newNote.title = '';
	};

	const deleteNote = async (id: number) => {
		const response = await api.delete(`/notes/${id}`);
		notes = response.data;
	};

	const editNote = async () => {
		await api.put(`/notes`, {
			id: selectedNote?.id,
			title: selectedNote?.title || ' ',
			content: selectedNote?.content || ' '
		});
	};

	onMount(() => {
		getNotes();
	});

	let selectedNote = $state<Note | null>(null);
	let newNote = $state({
		title: ''
	});
</script>

<Popover.Root>
	<Popover.Trigger class="w-full">
		<p class="hover:bg-muted flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm">
			<NotepadText class="size-3.5 text-[#5c5e63]" />
			Notas
		</p>
	</Popover.Trigger>
	<Popover.Content
		sideOffset={10}
		side="right"
		align="start"
		class="flex h-[50lvh] max-h-screen w-80 flex-col overflow-hidden p-0"
	>
		<div class="flex h-12 items-center justify-between border-b px-3 text-sm font-semibold">
			<p>Notas personales</p>
			{#if selectedNote}
				<Button
					variant="ghost"
					size="icon"
					onclick={() => {
						getNotes();
						selectedNote = null;
					}}><X class="size-3.5" /></Button
				>
			{/if}
		</div>

		{#if selectedNote}
			<div class="flex max-w-full flex-1 flex-col gap-[1px] overflow-y-auto">
				<Input
					class="!ring-none rounded-none border-none p-3"
					bind:value={selectedNote.title}
					onblur={editNote}
				/>
				<div class="w-full border"></div>
				<Textarea
					onblur={editNote}
					class="h-full resize-none rounded-none border-none"
					bind:value={selectedNote.content}
				/>
			</div>
		{:else}
			<div class="flex max-w-full flex-1 flex-col overflow-y-auto">
				{#each notes as note}
					<div class="grid grid-cols-[1fr_auto] items-center gap-2 border-b p-3">
						<button
							class="h-5 w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm font-medium"
							onclick={() => (selectedNote = note)}
						>
							{note.title}
						</button>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								><Button variant="ghost" size="icon">
									<Trash class="size-3.5 text-[#5c5e63]" />
								</Button></DropdownMenu.Trigger
							>
							<DropdownMenu.Content>
								<DropdownMenu.Item onclick={() => deleteNote(note.id)}>Borrar</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</div>
				{/each}

				<div class="grid grid-cols-[1fr_auto] items-center gap-2 p-3">
					<Input
						placeholder="Nueva nota"
						class="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm font-medium"
						bind:value={newNote.title}
						onkeydown={(event) => {
							if (event.key === 'Enter') createNote();
						}}
					/>

					<Button variant="ghost" size="icon" onclick={createNote}>
						<Check class="size-3.5 text-[#5c5e63]" />
					</Button>
				</div>
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
