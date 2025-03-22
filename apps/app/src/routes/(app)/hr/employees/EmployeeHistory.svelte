<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { Check, Minus, Pen, Plus } from 'lucide-svelte';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	import { cn } from '$lib/utils';
	import Card from '$lib/components/ui/card/card.svelte';
	interface Props {
		employee: any;
	}

	let { employee = $bindable() }: Props = $props();
	let docs: any[] = $state([]);

	let newDoc = $state({
		text: '',
		date: new Date(),
		type: ''
	});

	async function fetchData() {
		const serverDocs: any[] = (await api.get('/employees/history/' + employee.id)).data || [];
		docs = serverDocs.map((doc) => ({
			...doc,
			...getType(doc.type)
		}));
	}

	async function uploadNewDocument() {
		await api.post('/employees/history', { ...newDoc, employeeId: employee.id });

		newDoc = {
			text: '',
			date: new Date(),
			type: ''
		};

		showSuccess('Documento subido');
		fetchData();
	}

	$effect(() => {
		if (employee.id) fetchData();
	});

	const types: Record<string, { color: string; icon: any }> = {
		cambio: {
			color: 'cyan',
			icon: Pen
		},
		baja: {
			color: 'red',
			icon: Minus
		},
		alta: {
			color: 'green',
			icon: Plus
		}
	};

	function getType(type: string) {
		let result = types[type];
		if (!result) return { color: 'gray', icon: Minus };
		return result;
	}
</script>

<Table>
	<TableHeader class="sticky top-0 border-t">
		<TableHead class="border-l">Fecha</TableHead>
		<TableHead>Tipo</TableHead>
		<TableHead class="w-full border-r">Texto</TableHead>
	</TableHeader>
	<TableBody>
		<!-- {#each docs as row}
			<TableRow class="border-l">
				<TableCell>{format(new Date(row.date), 'dd/MM/yyyy', { locale: es })}</TableCell>
				<TableCell>{row.type}</TableCell>
				<TableCell class="w-full whitespace-normal">{row.text}</TableCell>
			</TableRow>
		{/each} -->

		<TableRow>
			<TableCell class="border-l px-[1px]"
				><Input type="date" class="rounded-none border-none" bind:value={newDoc.date} /></TableCell
			>
			<TableCell class="border-l px-[1px]"
				><Input class="w-32 rounded-none border-none" bind:value={newDoc.type} /></TableCell
			>
			<TableCell class="border-l px-[1px]"
				><Input class="rounded-none border-none" bind:value={newDoc.text} /></TableCell
			>

			<TableCell colspan={2} class="p-0"
				><Button onclick={uploadNewDocument} class="h-full w-full rounded-none" variant="ghost"
					><Check class="size-3.5" /></Button
				></TableCell
			>
		</TableRow>
	</TableBody>
</Table>

<div>
	<div class="mt-2 grid grid-cols-[auto_1fr] items-center gap-x-2 px-1">
		{#each docs as row}
			<div
				class={cn('bg-' + row.color, 'my-1.5 flex size-5 items-center justify-center rounded-full')}
			>
				<row.icon class={cn('size-3', 'text-' + row.color)} strokeWidth={1.5} />
			</div>
			<p class="text-xs">{format(new Date(row.date), 'dd/MM/yyyy', { locale: es })}</p>

			<div class="col-span-2 ml-[9px] border-l pl-2">
				<Card class=" rounded-sm px-3  py-1">{row.text}</Card>
			</div>
		{/each}
		<div class="bg-gray mt-1.5 flex size-5 items-center justify-center rounded-full"></div>
	</div>
</div>
