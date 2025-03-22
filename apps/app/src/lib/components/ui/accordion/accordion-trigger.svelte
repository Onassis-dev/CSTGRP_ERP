<script lang="ts">
	import { Accordion as AccordionPrimitive, type WithoutChild } from 'bits-ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		level = 3,
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.TriggerProps> & {
		level?: AccordionPrimitive.HeaderProps['level'];
	} = $props();
</script>

<AccordionPrimitive.Header {level} class="flex">
	<AccordionPrimitive.Trigger
		bind:ref
		class={cn(
			'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=closed]>svg.duration-200]:-rotate-90 [&[data-state=open]>svg.duration-200]:rotate-0',
			className
		)}
		{...restProps}
	>
		<span class="flex items-center gap-2">
			{@render children?.()}
		</span>
		<ChevronDown
			class="size-3.5 shrink-0 text-[#5c5e63] transition-transform duration-200"
			strokeWidth={1.2}
		/>
	</AccordionPrimitive.Trigger>
</AccordionPrimitive.Header>
