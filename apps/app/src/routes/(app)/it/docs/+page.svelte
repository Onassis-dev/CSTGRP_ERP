<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { PlusCircle } from 'lucide-svelte';
</script>

<MenuBar>
	{#snippet right()}
		<Button
			href="https://outline.onassis.dev/doc/sistemas-4DKyqJXUj1"
			target="_blank"
			size="action"
		>
			<PlusCircle class=" size-3.5" />Modificar
		</Button>
	{/snippet}
</MenuBar>

<iframe
	class="h-full w-full"
	title="Docs"
	src="https://outline.onassis.dev/s/c7f4fa03-65d8-4d72-a80f-da7ec1aa20c7"
></iframe>
