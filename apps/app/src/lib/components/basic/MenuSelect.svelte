<script lang="ts">
	import * as Select from '$lib/components/ui/select/index';
	import { cn } from '$lib/utils.js';
	import { ChevronDown } from 'lucide-svelte';

	interface Item {
		value: string | number;
		name: string;
	}

	interface Props {
		class?: string;
		items: Item[];
		placeholder?: string;
		value: Item['name'];
		onSelectedChange?: any;
		cell?: boolean;
		menu?: boolean;
		disabled?: boolean;
		children?: import('svelte').Snippet;
		chevron?: boolean;
	}

	let {
		class: className = '',
		items,
		placeholder = 'Selecciona una opción',
		value = $bindable(),
		cell = false,
		menu = false,
		disabled = false,
		children,
		chevron = true
	}: Props = $props();

	const triggerContent = $derived(items.find((f) => f.value === value)?.name ?? placeholder);
</script>

<Select.Root type="single" bind:value>
	<Select.Trigger
		{chevron}
		{disabled}
		class={cn(className, cell ? 'h-full w-full border-none' : '', menu ? 'h-[28px]' : '')}
	>
		{#if children}{@render children()}{:else}
			{triggerContent}
		{/if}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each items as item}
				<Select.Item value={item.value as string} label={item.name}>
					{item.name}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
