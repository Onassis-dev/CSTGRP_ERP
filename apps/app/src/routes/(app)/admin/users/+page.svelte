<script lang="ts">
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import DeletePopUp from '$lib/components/complex/DeletePopUp.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import UsersForm from './UsersForm.svelte';
	import { Circle, Eye, Minus, Pen, PlusCircle } from 'lucide-svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import OptionsCell from '$lib/components/basic/OptionsCell.svelte';
	import { getClients } from '$lib/utils/queries';
	import { createQuery } from '@tanstack/svelte-query';
	import { refetch } from '$lib/utils/query';
	import OptionsHead from '$lib/components/basic/OptionsHead.svelte';
	import { baseUser } from './users.utils';

	let show: boolean = $state(false);
	let show1: boolean = $state(false);
	let selectedUser = $state(baseUser);

	const users = createQuery({
		queryKey: ['users'],
		queryFn: async () => (await api.get('/users')).data
	});

	const clients = createQuery({
		queryKey: ['clients'],
		queryFn: getClients
	});

	function editUser(i: number) {
		selectedUser = $users?.data?.[i];
		show = true;
	}
	function createUser() {
		selectedUser = baseUser;
		show = true;
	}

	function deleteUser(i: number) {
		selectedUser = $users?.data?.[i];
		show1 = true;
	}

	async function handleDelete() {
		await api.delete('/users', { data: { id: parseInt(selectedUser.id) } });
		selectedUser = baseUser;
		showSuccess('Usuario eliminado');
		refetch(['users']);
		show1 = false;
	}

	function getBadgeColor(num: number): 'gray' | 'green' | 'blue' | 'purple' | 'red' {
		if (num === 0) return 'gray';
		if (num === 1) return 'green';
		if (num === 2) return 'blue';
		if (num === 3) return 'purple';
		if (num === 4) return 'red';
		return 'gray';
	}

	const badgeTexts = [null, Eye, Pen, Circle, Minus];
</script>

<MenuBar>
	{#snippet right()}
		<Button onclick={createUser} size="action"
			><PlusCircle class="ml-auto  size-3.5" />Añadir Usuario</Button
		>
	{/snippet}
</MenuBar>

<CusTable>
	<TableHeader>
		<OptionsHead />
		<TableHead colspan={1}>-</TableHead>
		<TableHead colspan={6}>General</TableHead>
		<TableHead colspan={1}>Calidad</TableHead>
		<TableHead colspan={2}>Reportes</TableHead>
		<TableHead colspan={4}>RRHH</TableHead>
		<TableHead colspan={7}>Producción</TableHead>
		<TableHead colspan={5}>Almacen</TableHead>
		<TableHead colspan={3}>Import-Export</TableHead>
		<TableHead colspan={2}>-</TableHead>
	</TableHeader>
	<TableHeader>
		<OptionsHead />
		<TableHead class="w-[12.5%]">Usuario</TableHead>
		<TableHead class="w-[12.5%]">Usuarios</TableHead>
		<TableHead class="w-[12.5%]">Estructura</TableHead>
		<TableHead class="w-[12.5%]">Formatos</TableHead>
		<TableHead class="w-[12.5%]">Directorio</TableHead>
		<TableHead class="w-[12.5%]">Docs</TableHead>
		<TableHead class="w-[12.5%]">Labels</TableHead>
		<TableHead class="w-[12.5%]">-</TableHead>
		<TableHead class="w-[12.5%]">Ordenes</TableHead>
		<TableHead class="w-[12.5%]">Productividad</TableHead>
		<TableHead class="w-[12.5%]">Dashboard</TableHead>
		<TableHead class="w-[12.5%]">Empleados</TableHead>
		<TableHead class="w-[12.5%]">Asistencia</TableHead>
		<TableHead class="w-[12.5%]">Productividad</TableHead>
		<TableHead class="w-[12.5%]">Corte</TableHead>
		<TableHead class="w-[12.5%]">Cortes Varios</TableHead>
		<TableHead class="w-[12.5%]">Producción</TableHead>
		<TableHead class="w-[12.5%]">Calidad</TableHead>
		<TableHead class="w-[12.5%]">Serigrafía</TableHead>
		<TableHead class="w-[12.5%]">Historial</TableHead>
		<TableHead class="w-[12.5%]">Jobs</TableHead>
		<TableHead class="w-[12.5%]">Dashboard</TableHead>
		<TableHead class="w-[12.5%]">Inventario</TableHead>
		<TableHead class="w-[12.5%]">Movimientos</TableHead>
		<TableHead class="w-[12.5%]">Requisiciones</TableHead>
		<TableHead class="w-[12.5%]">Peticiones</TableHead>
		<TableHead class="w-[12.5%]">Importaciones</TableHead>
		<TableHead class="w-[12.5%]">Exportaciones</TableHead>
		<TableHead class="w-[12.5%]">Opciones</TableHead>
		<TableHead class="w-[12.5%]">Sistemas</TableHead>
		<TableHead class="w-[12.5%]">Compras</TableHead>
		<TableHead class="w-[12.5%]">Cliente</TableHead>
		<TableHead class="w-[12.5%]">Block</TableHead>
	</TableHeader>
	<TableBody>
		{#each $users?.data as user, i}
			<TableRow>
				<OptionsCell editFunc={() => editUser(i)} deleteFunc={() => deleteUser(i)} />

				<TableCell class="font-semibold">{user.username}</TableCell>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.users)}
					>
						{@const SvelteComponent = badgeTexts[user.permissions.users]}
						<SvelteComponent class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.structure)}
					>
						{@const SvelteComponent_1 = badgeTexts[user.permissions.structure]}
						<SvelteComponent_1 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.formats)}
					>
						{@const SvelteComponent_1 = badgeTexts[user.permissions.formats]}
						<SvelteComponent_1 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.directory)}
					>
						{@const SvelteComponent_1 = badgeTexts[user.permissions.directory]}
						<SvelteComponent_1 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.docs)}
					>
						{@const SvelteComponent_1 = badgeTexts[user.permissions.docs]}
						<SvelteComponent_1 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.labels)}
					>
						{@const SvelteComponent_1 = badgeTexts[user.permissions.labels]}
						<SvelteComponent_1 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.quality)}
					>
						{@const SvelteComponent_1 = badgeTexts[user.permissions.quality]}
						<SvelteComponent_1 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.reports_orders)}
					>
						{@const SvelteComponent_2 = badgeTexts[user.permissions.reports_orders]}
						<SvelteComponent_2 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.reports_areas)}
					>
						{@const SvelteComponent_2 = badgeTexts[user.permissions.reports_areas]}
						<SvelteComponent_2 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.hr_dashboard)}
					>
						{@const SvelteComponent_3 = badgeTexts[user.permissions.hr_dashboard]}
						<SvelteComponent_3 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.employees)}
					>
						{@const SvelteComponent_3 = badgeTexts[user.permissions.employees]}
						<SvelteComponent_3 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.assistance)}
					>
						{@const SvelteComponent_2 = badgeTexts[user.permissions.assistance]}
						<SvelteComponent_2 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.productivity)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.productivity]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.prod_corte)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.prod_corte]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.prod_cortesVarios)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.prod_cortesVarios]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.prod_produccion)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.prod_produccion]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.prod_calidad)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.prod_calidad]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.prod_serigrafia)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.prod_serigrafia]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.prodmovements)}
					>
						{@const SvelteComponent_4 = badgeTexts[user.permissions.prodmovements]}
						<SvelteComponent_4 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.jobs)}
					>
						{@const SvelteComponent_10 = badgeTexts[user.permissions.jobs]}
						<SvelteComponent_10 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.inventorystats)}
					>
						{@const SvelteComponent_5 = badgeTexts[user.permissions.inventorystats]}
						<SvelteComponent_5 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.inventory)}
					>
						{@const SvelteComponent_6 = badgeTexts[user.permissions.inventory]}
						<SvelteComponent_6 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.materialmovements)}
					>
						{@const SvelteComponent_7 = badgeTexts[user.permissions.materialmovements]}
						<SvelteComponent_7 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.requisitions)}
					>
						{@const SvelteComponent_8 = badgeTexts[user.permissions.requisitions]}
						<SvelteComponent_8 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.petitions)}
					>
						{@const SvelteComponent_9 = badgeTexts[user.permissions.petitions]}
						<SvelteComponent_9 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.imports)}
					>
						{@const SvelteComponent_11 = badgeTexts[user.permissions.imports]}
						<SvelteComponent_11 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.exports)}
					>
						{@const SvelteComponent_11 = badgeTexts[user.permissions.exports]}
						<SvelteComponent_11 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.ie_options)}
					>
						{@const SvelteComponent_11 = badgeTexts[user.permissions.ie_options]}
						<SvelteComponent_11 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.it)}
					>
						{@const SvelteComponent_11 = badgeTexts[user.permissions.it]}
						<SvelteComponent_11 class="size-3.5" />
					</Badge></TableCell
				>
				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.permissions.purchases)}
					>
						{@const SvelteComponent_11 = badgeTexts[user.permissions.purchases]}
						<SvelteComponent_11 class="size-3.5" />
					</Badge></TableCell
				>

				<TableCell class="p-1.5 text-center">
					{#if user.clientId}
						<Badge class="" color={$clients?.data?.[user.clientId]?.color}>
							{$clients?.data?.[user.clientId]?.name}
						</Badge>
					{/if}
				</TableCell>

				<TableCell class="p-1.5 text-center"
					><Badge
						class="flex h-full w-full items-center justify-center p-1"
						color={getBadgeColor(user.maintance ? 4 : 0)}
					>
						{@const SvelteComponent_12 = badgeTexts[user.maintance ? 4 : 0]}
						<SvelteComponent_12 class="size-3.5" />
					</Badge></TableCell
				>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>

<UsersForm bind:show bind:selectedUser />
<DeletePopUp bind:show={show1} text="Eliminar usuario" deleteFunc={handleDelete} />
