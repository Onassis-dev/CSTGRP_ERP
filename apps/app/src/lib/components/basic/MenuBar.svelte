<script lang="ts">
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Filter } from 'lucide-svelte';
	import { Button } from '../ui/button';
	interface Props {
		left?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		right?: import('svelte').Snippet;
	}

	let { left, children, right }: Props = $props();
</script>

<div class="flex h-[49px] items-center justify-between border-b px-2.5">
	<div class="flex w-full justify-between lg:hidden">
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button variant="outline" class="flex items-center gap-2">
					<Filter class="size-3.5" />
					Filtrar
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent class="grid gap-2 p-2">
				{@render left?.()}
				{@render children?.()}
			</DropdownMenuContent>
		</DropdownMenu>
		<div>
			{@render right?.()}
		</div>
	</div>
	<div class="hidden w-full justify-between gap-2 lg:flex">
		<div class="flex gap-1.5">
			{@render left?.()}
			{@render children?.()}
		</div>
		<div class="flex gap-1.5">
			{@render right?.()}
		</div>
	</div>
</div>
