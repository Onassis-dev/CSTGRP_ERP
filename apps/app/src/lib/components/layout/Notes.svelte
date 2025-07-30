<script lang="ts">
	import { Dialog, DialogBody, DialogContent, DialogHeader } from '$lib/components/ui/dialog';
	import { onMount } from 'svelte';
	import api from '$lib/utils/server';
	import { Textarea } from '../ui/textarea';

	let { show = $bindable(false) }: { show: boolean } = $props();

	let text = $state('');

	const getNote = async () => {
		const response = await api.get('/notes');
		text = response.data;
	};
	const editNote = async () => {
		await api.put(`/notes`, { text });
	};

	onMount(() => {
		getNote();
	});

	$effect(() => {
		text;
		const handler = setTimeout(() => {
			editNote();
		}, 250);
		return () => clearTimeout(handler);
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="z-[51] min-h-[50vh] sm:max-w-md">
		<DialogHeader title="Notas" />

		<DialogBody class="p-0">
			<Textarea
				bind:value={text}
				class="h-full w-full resize-none rounded-none !border-0"
				placeholder="Escribe tus notas aquí..."
			/>
		</DialogBody>
	</DialogContent>
</Dialog>
