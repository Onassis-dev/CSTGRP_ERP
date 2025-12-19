<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import { format } from 'date-fns';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { FileDown, FilePlus2, Search } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import RequisitionForm from './RequisitionForm.svelte';
	import { es } from 'date-fns/locale';
	import SuppliesForm from './SuppliesForm.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { getClients } from '$lib/utils/queries';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';

	let show = $state(false);
	let show2 = $state(false);

	let filters = $state({
		programation: '',
		import: '',
		jobpo: '',
		code: '',
		checked: ''
	});

	let selectedMovement: any = $state();

	const movementsQuery = createQuery({
		queryKey: ['requisitions', { ...filters }],
		queryFn: async () => (await api.get('/requisitions/movements', { params: filters })).data
	});

	const clients = createQuery({
		queryKey: ['clients'],
		queryFn: getClients
	});

	function createRequisition(i: number) {
		show = true;
		selectedMovement = $movementsQuery?.data[i];
	}

	async function exportUncheckedMovements() {
		const response = await api.get('/requisitions/export-pending', {
			responseType: 'arraybuffer'
		});

		const blob = new Blob([response.data], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});

		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `Pendientes ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}.xlsx`;

		document.body.appendChild(link);

		link.click();

		document.body.removeChild(link);
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-1.5 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['requisitions']))}
	>
		<Input menu bind:value={filters.programation} placeholder="Programacion" />
		<Input menu bind:value={filters.jobpo} placeholder="Job" />
		<Input menu bind:value={filters.code} placeholder="Material" />
		<Button type="submit" variant="outline" size="icon"><Search class="size-3.5" /></Button>
	</form>

	{#snippet right()}
		<Button onclick={exportUncheckedMovements} variant="outline" size="icon"
			><FileDown class="size-3.5" /></Button
		>
		<Button onclick={() => (show2 = true)} size="action"
			><FilePlus2 class=" size-3.5" />Insumos</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead>Programacion</TableHead>
		<TableHead>Job-PO</TableHead>
		<TableHead>Codigo</TableHead>
		<TableHead>Descripcion</TableHead>
		<TableHead>Inventario</TableHead>
		<TableHead>En area</TableHead>
		<TableHead>Requerido</TableHead>
		<TableHead>Medida</TableHead>
		<TableHead>Cliente</TableHead>
	</TableHeader>
	<TableBody>
		{#each $movementsQuery?.data as movement, i}
			<TableRow>
				<OptionsCell
					extraButtons={[
						{
							fn: () => createRequisition(i),
							name: 'Requisicion',
							icon: FilePlus2
						}
					]}
				/>
				<TableCell>{movement.programation || ''}</TableCell>
				<TableCell>{movement.ref || ''}</TableCell>
				<TableCell>{movement.code}</TableCell>
				<TableCell class="w-full min-w-24 max-w-1 overflow-hidden text-ellipsis"
					>{movement.description}</TableCell
				>
				<TableCell><Badge color="gray">{movement.inventory}</Badge></TableCell>
				<TableCell><Badge color="gray">{movement.leftoverAmount}</Badge></TableCell>
				<TableCell><Badge color={'red'}>{movement.amount}</Badge></TableCell>
				<TableCell>{movement.measurement}</TableCell>
				<TableCell
					>{#if $clients?.data?.[movement.clientId]}
						<Badge color={$clients?.data?.[movement.clientId]?.color}
							>{$clients?.data?.[movement.clientId]?.name}
						</Badge>
					{/if}</TableCell
				>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<RequisitionForm bind:show bind:selectedMovement />
<SuppliesForm bind:show={show2} />
