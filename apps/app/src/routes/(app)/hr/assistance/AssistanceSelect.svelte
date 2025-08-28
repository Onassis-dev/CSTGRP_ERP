<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { showError } from '$lib/utils/showToast';
	import { Check } from 'lucide-svelte';
	import { untrack } from 'svelte';

	interface Props {
		incidences: any[];
		areas: any[];
		value: any;
		areaId: any;
		hours: any;
		onValueChange: () => void;
	}

	let {
		incidences,
		areas,
		value = $bindable(),
		areaId = $bindable(),
		hours = $bindable(0),
		onValueChange
	}: Props = $props();

	let inputValue = $state(0);
	let previousHours = $state(hours);

	$effect(() => {
		if (hours !== previousHours) {
			untrack(() => {
				inputValue = 570 - hours;
				previousHours = hours;
			});
		}
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={`h-full w-full rounded-none text-xs leading-[1.1] ${areaId ? 'text-red-500' : ''}`}
	>
		{incidences.find((e) => e.value === value)?.name}
		{#if hours !== 570 && hours !== 0 && typeof hours === 'number'}
			({570 - hours}m)
		{/if}
		{#if areaId}
			<br />
			{areas.find((e) => e.value === areaId)?.name}
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each incidences as incidence}
			{#if incidence.name === 'RETARDO' || incidence.name === 'PERMISO'}
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>{incidence.name}</DropdownMenu.SubTrigger>
					<DropdownMenu.SubContent class="flex flex-col gap-2">
						<Input bind:value={inputValue} type="number" />
						<DropdownMenu.Item
							class="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center"
							onclick={() => {
								const newValue = Number(inputValue);
								if (newValue > 0 && newValue < 570) {
									hours = 570 - newValue;
									value = incidence.value;
									onValueChange();
								} else {
									showError(null, 'El valor debe ser entre 1 y 570 minutos');
									inputValue = 0;
								}
							}}
						>
							Guardar
						</DropdownMenu.Item>
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
			{:else}
				<DropdownMenu.Item
					onSelect={() => {
						value = incidence.value;
						hours = incidence.value === '1' ? 570 : 0;
						onValueChange();
					}}>{incidence.name}</DropdownMenu.Item
				>
			{/if}
		{/each}
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger class="text-red-500">APOYO</DropdownMenu.SubTrigger>
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
