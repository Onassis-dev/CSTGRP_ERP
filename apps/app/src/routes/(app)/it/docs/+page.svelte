<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { PlusCircle } from 'lucide-svelte';
</script>

<MenuBar>
	{#snippet right()}
		<Button
			href="https://app.gitbook.com/o/c1F7mmoWJQHCzfOVAWjT/s/kXdm8ZrQNS1S4LlC3bHn/"
			target="_blank"
		>
			<PlusCircle class=" size-3.5" />Modificar
		</Button>
	{/snippet}
</MenuBar>

<iframe class="h-full w-full" title="Docs" src="https://onassiss-organization.gitbook.io/cst-group"
></iframe>
