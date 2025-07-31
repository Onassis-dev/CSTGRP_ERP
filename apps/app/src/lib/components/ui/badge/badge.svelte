<script lang="ts" module>
	import { type VariantProps, tv } from 'tailwind-variants';

	export const badgeVariants = tv({
		base: 'focus:ring-ring outline outline-1 inline-flex select-none items-center rounded-[6px] px-1.5  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80 ',
				outline: 'bg-transparent text-foreground outline-border ',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 ',
				gray: 'bg-gray text-gray-foreground outline-gray-foreground/20 ',
				red: 'bg-red text-red-foreground outline-red-foreground/20 ',
				orange: 'bg-orange text-orange-foreground outline-orange-foreground/20 ',
				lime: 'bg-lime text-lime-foreground outline-lime-foreground/20 ',
				green: 'bg-green text-green-foreground outline-green-foreground/20 ',
				cyan: 'bg-cyan text-cyan-foreground outline-cyan-foreground/20 ',
				blue: 'bg-blue text-blue-foreground outline-blue-foreground/20 ',
				purple: 'bg-purple text-purple-foreground outline-purple-foreground/20 ',
				yellow: 'bg-yellow text-yellow-foreground outline-yellow-foreground/20 ',
				pink: 'bg-pink text-pink-foreground outline-pink-foreground/20 '
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];
</script>

<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		href,
		class: className,
		color = 'default',
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		color?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	bind:this={ref}
	{href}
	class={cn(badgeVariants({ variant: color }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
