<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { FileDown, Pen, Search } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { format } from 'date-fns';
	import MovementsMenu from './MovementsMenu.svelte';
	import { es } from 'date-fns/locale';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import { getClients } from '$lib/utils/queries';
	import { downloadFile } from '$lib/utils/files';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { userData } from '$lib/utils/store';
	import MovementsForm from './MovementsForm.svelte';

	let show2 = $state(false);
	let show3 = $state(false);
	let show4 = $state(false);
	let selectedMovement: any = $state();
	let movementI = $state(0);
	let previousAmount = $state('');

	let filters = $state({
		programation: '',
		import: '',
		jobpo: '',
		code: '',
		req: '',
		checked: '',
		type: ''
	});

	let checkStatus = [
		{ value: '', name: 'Sin filtro' },
		{ value: 'true', name: 'Surtido', color: 'red' },
		{ value: 'false', name: 'No surtido', color: 'red' }
	];

	let types = [
		{ value: '', name: 'Sin tipo' },
		{ value: 'return', name: 'Retorno', color: 'red' },
		{ value: 'scrap', name: 'Scrap', color: 'red' },
		{ value: 'consumable', name: 'Insumo', color: 'red' },
		{ value: 'adjustment', name: 'Ajuste', color: 'red' }
	];

	const movements = createQuery({
		queryKey: ['material-movements', { ...filters }],
		queryFn: async () => (await api.get('/materialmovements', { params: filters })).data
	});

	const clients = createQuery({
		queryKey: ['clients'],
		queryFn: getClients
	});

	function viewCheckModal(i: number) {
		show2 = true;
		movementI = i;
	}

	async function checkMovement() {
		const result = await api.put('/materialmovements/activate', {
			id: $movements.data[movementI].id
		});
		showSuccess(result.data ? 'Check eliminado' : 'Material surtido');
		show2 = false;
		refetch(['material-movements']);
	}

	async function changeAmount(id: string, amount: string) {
		await api.put('/materialmovements/realamount', { id: id, newAmount: amount });
		showSuccess('Cantidad actualizada');
		refetch(['material-movements']);
	}
</script>

<MenuBar>
	<form
		class="flex flex-col gap-1.5 lg:flex-row"
		onsubmit={preventDefault(() => refetch(['material-movements']))}
	>
		<Input menu bind:value={filters.import} placeholder="Importacion" class="max-w-32" />
		<Input menu bind:value={filters.programation} placeholder="Programacion" class="max-w-32" />
		<Input menu bind:value={filters.jobpo} placeholder="Job" class="max-w-32" />
		<Input menu bind:value={filters.code} placeholder="Material" class="max-w-32" />
		<Input menu bind:value={filters.req} placeholder="Req" class="max-w-32" />
		<Select
			menu
			items={checkStatus}
			bind:value={filters.checked}
			class="min-w-32 max-w-32"
			onValueChange={() => refetch(['material-movements'])}
		/>
		<Select
			menu
			items={types}
			bind:value={filters.type}
			class="min-w-32 max-w-32"
			onValueChange={() => refetch(['material-movements'])}
		/>
		<Button type="submit" variant="outline" size="icon"><Search class="size-3.5" /></Button>
	</form>
	{#snippet right()}
		<Button
			variant="outline"
			size="icon"
			onclick={() =>
				downloadFile({
					url: '/materialmovements/export-pending',
					name: `Pendientes ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}.xlsx`
				})}><FileDown class="size-3.5" /></Button
		>

		<Button onclick={() => (show3 = true)} size="action"><Pen class=" size-3.5" />Registrar</Button>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead>Ref</TableHead>
		<TableHead>Programacion</TableHead>
		<TableHead>Req</TableHead>
		<TableHead>Codigo</TableHead>
		<TableHead>Descripcion</TableHead>
		<TableHead>Inventario</TableHead>
		<TableHead>Sobrante</TableHead>
		<TableHead>Cantidad</TableHead>
		<TableHead>Cantidad Real</TableHead>
		<TableHead>Medida</TableHead>
		<TableHead>Cliente</TableHead>
		<TableHead></TableHead>
	</TableHeader>
	<TableBody>
		{#each $movements.data as movement, i}
			<TableRow>
				<TableCell
					>{(movement.ref || '') + (movement.extra ? ' -R' : '')}

					{#if $userData?.permissions.materialmovements >= 3 && (movement.type || movement.jobId)}
						<Button
							size="icon"
							variant="outline"
							class="ml-1"
							onclick={() => {
								selectedMovement = movement;
								show4 = true;
							}}><Pen class="size-3.5" /></Button
						>
					{/if}
				</TableCell>
				<TableCell>{movement.programation || ''}</TableCell>
				<TableCell>{movement.req || ''}</TableCell>
				<TableCell>{movement.code}</TableCell>
				<TableCell
					class="w-full min-w-24 max-w-1 overflow-hidden text-ellipsis"
					title={movement.description}>{movement.description}</TableCell
				>
				<TableCell><Badge color="gray">{movement.inventory}</Badge></TableCell>
				<TableCell><Badge color="gray">{movement.leftoverAmount}</Badge></TableCell>
				<TableCell
					><Badge color={parseFloat(movement.amount) >= 0 ? 'green' : 'red'}
						>{movement.amount}</Badge
					></TableCell
				>

				<TableCell
					><Input
						menu
						class="w-24"
						type="text"
						bind:value={movement.realAmount}
						onfocus={(e) => (previousAmount = (e.target as HTMLInputElement).value)}
						onblur={async (e) => {
							try {
								await changeAmount(movement.id, movement.realAmount);
							} catch (err: any) {
								(e.target as HTMLInputElement).value = previousAmount;
								throw err;
							}
						}}
					/></TableCell
				>
				<TableCell>{movement.measurement}</TableCell>
				<TableCell
					>{#if $clients?.data?.[movement.clientId]}
						<Badge color={$clients?.data?.[movement.clientId]?.color}
							>{$clients?.data?.[movement.clientId]?.name}
						</Badge>
					{/if}</TableCell
				>
				<TableCell class="px-2"
					><Checkbox
						onclick={(e) => {
							e.preventDefault();
							viewCheckModal(i);
						}}
						checked={movement.active}
					/></TableCell
				>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<DeletePopUp
	bind:show={show2}
	deleteFunc={checkMovement}
	text={`Surtir ${$movements.data[movementI]?.realAmount}${$movements.data[movementI]?.measurement} del material ${$movements.data[movementI]?.code}?`}
	warning={true}
/>
<MovementsMenu bind:show={show3} />
<MovementsForm bind:show={show4} {selectedMovement} />
