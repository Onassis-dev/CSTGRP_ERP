<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import Button from '../button/button.svelte';

	let {
		ref = $bindable(null),
		class: className,
		children,
		submitFunc,
		hideFunc,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		submitFunc?: () => void;
		hideFunc?: () => void;
	} = $props();
</script>

<div
	bind:this={ref}
	class={cn('grid grid-cols-2 gap-2 border-t p-6 pt-4', className)}
	{...restProps}
>
	{#if submitFunc}
		<Button onclick={submitFunc}>Guardar</Button>
	{/if}
	{#if hideFunc}
		<Button onclick={hideFunc} variant="outline">Cancelar</Button>
	{/if}
	{@render children?.()}
</div>
