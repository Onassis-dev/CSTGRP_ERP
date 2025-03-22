<script lang="ts">
	import { onMount, tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import api from '../../utils/server';
	import Input from '../ui/input/input.svelte';

	interface Props {
		value: string | undefined;
		measurement?: string;
		normal?: boolean;
	}

	let { value = $bindable(), measurement = $bindable(), normal = false }: Props = $props();

	async function getMeasurement() {
		measurement = (await api.get('/inventoryvarious/measurement?code=' + value)).data;
	}

	let materials = $state<string[]>([]);

	async function getMaterials() {
		materials = (await api.get('/inventoryvarious/materials')).data;
	}

	onMount(() => {
		getMaterials();
	});

	$effect(() => {
		if (value) getMeasurement();
	});

	let open = $state(false);

	let filteredMaterials = $derived(
		materials
			.filter((material) => material.toLowerCase().includes(value?.toLowerCase() || ''))
			.slice(0, 30)
	);
</script>

<Popover.Root bind:open>
	<Command.Root shouldFilter={false}>
		<Popover.Trigger>
			<Input
				bind:value
				class={cn(
					normal ? '' : 'rounded-none border-none',
					measurement ? '' : 'bg-destructive text-destructive-foreground'
				)}
			/>
		</Popover.Trigger>
		<Popover.Content
			class="p-0"
			trapFocus={false}
			onOpenAutoFocus={(e) => e.preventDefault()}
			onCloseAutoFocus={(e) => e.preventDefault()}
		>
			<Command.List>
				<Command.Empty>Sin resultados</Command.Empty>
				<Command.Group>
					{#each filteredMaterials as material}
						<Command.Item
							value={material}
							onSelect={() => {
								value = material;
								open = false;
							}}
						>
							{material}
						</Command.Item>
					{/each}
				</Command.Group>
			</Command.List>
		</Popover.Content>
	</Command.Root>
</Popover.Root>
