<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { Button } from '$lib/components/ui/button';
	import IELabelForm from './IELabelForm.svelte';
	import DashboardBody from '$lib/components/basic/DashboardBody.svelte';

	let showForm = $state(false);
</script>

<MenuBar></MenuBar>

<DashboardBody
	title="Import Export"
	class="grid grid-cols-12 grid-rows-[7rem_19rem_22rem] place-items-stretch gap-4 "
>
	<Card class="col-span-3 w-full max-w-full">
		<CardHeader>
			<CardTitle>Etiquetas de pallets</CardTitle>
		</CardHeader>

		<CardContent chart class="flex flex-col">
			<Button variant="outline" onclick={() => (showForm = true)}>Generar</Button>
		</CardContent>
	</Card>
</DashboardBody>

<IELabelForm bind:show={showForm} />
