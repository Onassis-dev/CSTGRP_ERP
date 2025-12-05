<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import api from '$lib/utils/server';
	import { PlusCircle } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { getAreas, getOptions } from '$lib/utils/queries';
	import { Input } from '$lib/components/ui/input';
	import Select from '$lib/components/basic/Select.svelte';
	import DashboardBody from '$lib/components/basic/DashboardBody.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';

	const stats = createQuery({
		queryKey: ['maintenance-stats'],
		queryFn: async () => (await api.get('/maintenance/stats')).data
	});
</script>

<MenuBar></MenuBar>

<DashboardBody
	title="Mantenimiento"
	class="grid grid-cols-12 grid-rows-[7rem_19rem_22rem] place-items-stretch gap-4 "
>
	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Maquinas activas</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="mb-2 flex items-center gap-2">
				<p class="text-2xl font-medium">{$stats.data?.active}</p>
				<p class="text-muted-foreground">/</p>
				<p class="text-muted-foreground text-2xl font-medium">{$stats.data?.total}</p>
			</div>
			<Progress value={($stats.data?.active / $stats.data?.total) * 100} />
		</CardContent>
	</Card>
</DashboardBody>
