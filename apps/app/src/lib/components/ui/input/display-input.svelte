<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { InputEvents } from './index.js';
	import { cn } from '$lib/utils.js';
	import Input from './input.svelte';

	type $$Props = HTMLInputAttributes & { edit: boolean; divClass?: string };
	type $$Events = InputEvents;

	let divClass: $$Props['divClass'] = undefined;

	interface Props {
		class?: $$Props['class'];
		value?: $$Props['value'];
		edit: $$Props['edit'];
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		value = $bindable(undefined),
		edit,
		children,
		...rest
	}: Props = $props();

	// Workaround for https://github.com/sveltejs/svelte/issues/9305
	// Fixed in Svelte 5, but not backported to 4.x.
</script>

{#if edit}
	{#if children}{@render children()}{:else}
		<Input bind:value class={cn('h-[1.75rem] p-1', className)} {...rest} />
	{/if}
{:else}
	<p class={cn('h-7 p-1 text-sm', divClass)}>{value || ''}</p>
{/if}
