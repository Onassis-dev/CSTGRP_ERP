<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Check } from 'lucide-svelte';

	interface Props {
		incidences: any[];
		areas: any[];
		value: any;
		areaId: any;
		onValueChange: () => void;
	}

	let {
		incidences,
		areas,
		value = $bindable(),
		areaId = $bindable(),
		onValueChange
	}: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={`h-full w-full rounded-none text-xs ${areaId ? 'text-blue-500' : ''}`}
		>{incidences.find((e) => e.value === value)?.name || ''}</DropdownMenu.Trigger
	>
	<DropdownMenu.Content>
		{#each incidences as incidence}
			<DropdownMenu.Item
				onSelect={() => {
					value = incidence.value;
					onValueChange();
				}}>{incidence.name}</DropdownMenu.Item
			>
		{/each}
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>APOYO</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				{#each areas as area}
					<DropdownMenu.Item
						onSelect={() => {
							if (area.value === areaId) {
								areaId = null;
							} else {
								areaId = area.value;
							}
							onValueChange();
						}}
					>
						{area.name}
						{#if area.value === areaId}
							<Check class="ml-auto size-3.5" />
						{/if}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
