<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogBody, DialogContent } from '$lib/components/ui/dialog';
	import { TriangleAlert } from 'lucide-svelte';

	interface Props {
		show?: boolean;
		action: any;
		text: any;
	}

	let { show = $bindable(false), action, text }: Props = $props();
</script>

<Dialog bind:open={show}>
	<DialogContent class="max-w-sm">
		<DialogBody>
			<div class="text-center">
				<TriangleAlert class="mx-auto mb-2 h-16 w-16 rounded-lg bg-red-50 p-1 text-red-500" />
				<h3 class="text-lg font-normal">{text}</h3>
			</div>
			<div class="mt-2 text-center">
				<Button onclick={action} class="me-2" size="sm">Confirmar</Button>
				<Button onclick={() => (show = false)} color="alternative" size="sm" variant="outline"
					>Cancelar</Button
				>
			</div>
		</DialogBody>
	</DialogContent>
</Dialog>
