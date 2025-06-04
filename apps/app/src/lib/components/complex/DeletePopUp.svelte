<script lang="ts">
	import { CircleAlert } from 'lucide-svelte';
	import { Button } from '../ui/button';
	import { Dialog, DialogBody, DialogContent } from '../ui/dialog';

	interface Props {
		show?: boolean;
		deleteFunc: any;
		text: any;
	}

	let { show = $bindable(false), deleteFunc, text }: Props = $props();
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogBody class="space-y-4 border-none">
			<div class="text-center">
				<CircleAlert class="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-200" />
				<h3 class=" text-lg font-normal text-gray-500 dark:text-gray-400">{text}</h3>
			</div>
			<div class="text-center">
				<Button onclick={deleteFunc} variant="destructive" class="me-2">Eliminar</Button>
				<Button onclick={() => (show = false)} variant="outline">Cancelar</Button>
			</div>
		</DialogBody>
	</DialogContent>
</Dialog>
