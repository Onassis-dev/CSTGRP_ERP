<script lang="ts">
	import { Dialog as DialogPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import * as Dialog from './index.js';
	import { cn } from '$lib/utils.js';
	import Conversor from '$lib/components/layout/Conversor.svelte';

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		closeButton = true,
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: DialogPrimitive.PortalProps;
		children: Snippet;
		closeButton?: boolean;
	} = $props();
</script>

<Dialog.Portal {...portalProps}>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		bind:ref
		class={cn(
			'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid h-screen w-full translate-x-[-50%] translate-y-[-50%] grid-rows-[auto_1fr_auto] overflow-auto scroll-auto border shadow-lg duration-200 sm:h-auto sm:max-h-[90lvh] sm:max-w-xl sm:rounded-lg md:w-full',
			className
		)}
		{...restProps}
	>
		<Conversor />
		{@render children?.()}
		{#if closeButton}
			<DialogPrimitive.Close
				class="ring-offset-background focus:ring-ring absolute right-4 top-5 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
			>
				<X class="size-3.5" />
				<span class="sr-only">Close</span>
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</Dialog.Portal>
