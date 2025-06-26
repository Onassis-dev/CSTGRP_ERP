<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
		DropdownMenuItem,
		DropdownMenuSeparator
	} from '$lib/components/ui/dropdown-menu';
	import { Ellipsis, Pen, Trash, Eye } from 'lucide-svelte';
	import { TableCell } from '$lib/components/ui/table';

	interface Props {
		viewFunc?: (() => void) | undefined;
		deleteFunc?: (() => void) | undefined;
		editFunc?: (() => void) | undefined;
		extraButtons?: { fn: () => void; name: string; icon: any }[];
		children?: import('svelte').Snippet;
	}

	let {
		viewFunc = undefined,
		deleteFunc = undefined,
		editFunc = undefined,
		extraButtons = [],
		children
	}: Props = $props();
</script>

<TableCell class="options-cell bg-background sticky left-0 border-r-0 p-0">
	<DropdownMenu>
		<DropdownMenuTrigger
			class="hover:bg-muted/50 flex aspect-square h-full items-center justify-center "
		>
			<Ellipsis class="text-muted-foreground size-3.5" />
		</DropdownMenuTrigger>

		<DropdownMenuContent side="bottom" align="start">
			{#if viewFunc}
				<DropdownMenuItem onclick={viewFunc}>
					<Eye class="size-3.5" /> Ver
				</DropdownMenuItem>
			{/if}
			{#if editFunc}
				<DropdownMenuItem onclick={editFunc}>
					<Pen class="size-3.5" /> Editar
				</DropdownMenuItem>
			{/if}
			{#each extraButtons as button}
				<DropdownMenuItem onclick={button.fn}>
					<button.icon class="size-3.5" />
					{button.name}
				</DropdownMenuItem>
			{/each}
			{@render children?.()}
			{#if deleteFunc}
				<DropdownMenuSeparator />
				<DropdownMenuItem onclick={deleteFunc} class="text-red-500">
					<Trash class="size-3.5" /> Eliminar
				</DropdownMenuItem>
			{/if}
		</DropdownMenuContent>
	</DropdownMenu>
</TableCell>

<style>
	:global(.options-cell) {
		position: relative;
	}
	:global(.options-cell::after) {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: -1px;
		width: 1px;
		height: 100%;
		background-color: hsl(var(--border));
	}
</style>
