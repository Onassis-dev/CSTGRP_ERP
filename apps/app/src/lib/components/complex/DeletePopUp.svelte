<script lang="ts">
	import { OctagonAlert } from 'lucide-svelte';
	import { Button } from '../ui/button';
	import { Dialog, DialogBody, DialogContent } from '../ui/dialog';
	import { cn } from '$lib/utils';

	interface Props {
		show?: boolean;
		deleteFunc: any;
		text: any;
		warning?: boolean;
	}

	let { show = $bindable(false), deleteFunc, text, warning = false }: Props = $props();
	let confirmButton = $state<HTMLButtonElement | null>(null);
</script>

<Dialog bind:open={show}>
	<DialogContent
		closeButton={false}
		class="h-auto sm:max-w-lg"
		onOpenAutoFocus={(e) => {
			e.preventDefault();
			confirmButton?.focus();
		}}
	>
		<DialogBody class="border-none">
			<h2 class="text-center text-lg font-semibold">
				<div
					class={cn(
						'mx-auto mb-2 flex size-14 items-center justify-center rounded-full',
						warning ? 'bg-yellow-50' : 'bg-red-50'
					)}
				>
					<OctagonAlert class={cn('size-7', warning ? 'text-yellow-500' : 'text-red-500')} />
				</div>
				Confirmar acción
			</h2>
			<p class="text-muted-foreground mt-2 text-center text-sm">{text}</p>
			<div class="mt-4 flex justify-center gap-2">
				<Button onclick={() => (show = false)} variant="outline">Cancelar</Button>
				<Button
					onclick={deleteFunc}
					variant={warning ? 'default' : 'destructive'}
					bind:ref={confirmButton}
				>
					{warning ? 'Confirmar' : 'Eliminar'}
				</Button>
			</div>
		</DialogBody>
	</DialogContent>
</Dialog>
