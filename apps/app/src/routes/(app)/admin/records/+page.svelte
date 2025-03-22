<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import CusTable from '$lib/components/basic/CusTable.svelte';
	import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { onMount } from 'svelte';
	import MenuBar from '$lib/components/basic/MenuBar.svelte';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import Select from '$lib/components/basic/Select.svelte';
	import { Input } from '$lib/components/ui/input';

	let records: any[] = $state([]);

	let filters = $state({
		module: 'users',
		text: '',
		user: ''
	});

	async function getRecords() {
		records = (
			await api.get('/records', {
				params: filters
			})
		).data;
	}

	onMount(() => {
		getRecords();
	});

	const actionColors: Record<string, string> = {
		create: 'bg-green',
		delete: 'bg-red',
		update: 'bg-yellow'
	};

	let options = [
		{ value: 'inventory', name: 'Inventario' },
		{ value: 'hr', name: 'RRHH' },
		{ value: 'users', name: 'Usuarios' },
		{ value: 'auth', name: 'Sesión' }
	];

	$effect(() => {
		if (filters.module) {
			getRecords();
		}
	});
</script>

<MenuBar>
	<form class="flex flex-col gap-2 lg:flex-row" onsubmit={preventDefault(getRecords)}>
		<Select class="min-w-36" menu items={options} bind:value={filters.module} />
		<Input
			menu
			bind:value={filters.text}
			placeholder="Texto..."
			onkeydown={(e) => {
				if (e.key === 'Enter') getRecords();
			}}
		/>
		<Input
			menu
			bind:value={filters.user}
			placeholder="Usuario..."
			onkeydown={(e) => {
				if (e.key === 'Enter') getRecords();
			}}
		/>
	</form>
</MenuBar>

<CusTable>
	<TableHeader>
		<TableHead>Creado</TableHead>
		<TableHead>Usuario</TableHead>
		<TableHead class="w-full">Mensaje</TableHead>
	</TableHeader>
	<TableBody>
		{#each records as record}
			<TableRow>
				<TableCell class={actionColors[record.action]}
					>{format(new Date(record.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell
				>
				<TableCell>{record.user}</TableCell>
				<TableCell>{record.text}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</CusTable>
