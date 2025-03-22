<script lang="ts">
	import { Accordion as AccordionPrimitive, type WithoutChild } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithoutChild<AccordionPrimitive.ContentProps> = $props();
</script>

<AccordionPrimitive.Content
	bind:ref
	class={cn(
		'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm transition-all',
		className
	)}
	{...restProps}
>
	<div class="mb-4 ml-3.5 flex flex-col gap-[1px] border-l pl-1.5 pt-0">
		{@render children?.()}
	</div>
</AccordionPrimitive.Content>
