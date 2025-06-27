<script lang="ts">
	import * as Select from '$lib/components/ui/select/index';
	import { cn } from '$lib/utils.js';

	interface Item {
		value: string | number;
		name: string;
		color?: string;
	}

	interface Props {
		class?: string;
		items: Item[];
		placeholder?: string;
		value: Item['name'];
		cell?: boolean;
		menu?: boolean;
		disabled?: boolean;
		children?: import('svelte').Snippet;
		chevron?: boolean;
		allowDeselect?: boolean;
		onValueChange?: () => void;
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
		chevron = true,
		allowDeselect = false,
		onValueChange
	}: Props = $props();

	const variants: Record<string, string> = {
		default: 'bg-primary-400',
		secondary: 'bg-secondary-400',
		gray: 'bg-gray-400',
		red: 'bg-red-400',
		orange: 'bg-orange-400',
		lime: 'bg-lime-400',
		green: 'bg-green-400',
		cyan: 'bg-cyan-400',
		blue: 'bg-blue-400',
		purple: 'bg-purple-400',
		yellow: 'bg-yellow-400',
		pink: 'bg-pink-400'
	};

	const triggerContent: Omit<Item, 'value'> = $derived(
		items?.find((f) => f.value === value) ?? { name: placeholder }
	);
</script>

<Select.Root type="single" bind:value {allowDeselect} {onValueChange}>
	<Select.Trigger
		{chevron}
		{disabled}
		class={cn(className, cell ? 'h-full w-full border-none' : '', menu ? 'h-7' : '')}
	>
		<div class="flex w-full items-center gap-2">
			{#if children}{@render children()}{:else}
				<div class="flex items-center gap-2">
					{#if triggerContent.color}
						<div class={cn('size-2 rounded-full', variants[triggerContent.color])}></div>
					{/if}
					{triggerContent.name}
				</div>
			{/if}
		</div>
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each items as item}
				<Select.Item value={item.value as string} label={item.name} color={item.color} {variants}>
					{item.name}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
