<script lang="ts">
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Loader2 } from 'lucide-svelte';
	import api from '$lib/utils/server';
	import { cn } from '$lib/utils';

	const { id } = $props();

	let vacations: any[] = $state([]);
	let loading = $state(false);

	async function getData() {
		if (!id) return;
		loading = true;
		vacations = (await api.get(`/employees/vacations/${id}`)).data;
		loading = false;
	}

	$effect(() => {
		if (id) getData();
	});
</script>

{#if loading}
	<div class="flex h-32 w-full items-center justify-center">
		<Loader2 class="size-4 animate-spin" />
	</div>
{:else if vacations.length}
	{#each vacations as vacation}
		<div class="mb-2 grid grid-cols-2 rounded-lg border p-4 px-8">
			<div>{vacation.date}</div>
			<div class={cn('ml-auto text-left font-bold', vacation.days < 0 ? 'text-red-500' : '')}>
				{vacation.days}
			</div>
			{#if vacation.notes}
				<div class="col-span-full text-sm text-muted-foreground">
					<span class="font-bold">Nota:</span>
					{vacation.notes}
				</div>
			{/if}
		</div>
	{/each}
{:else}
	<div class="flex h-32 w-full items-center justify-center">Sin historial de vacaciones</div>
{/if}
