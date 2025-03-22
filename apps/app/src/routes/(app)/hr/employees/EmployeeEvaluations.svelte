<script lang="ts">
	import { run } from 'svelte/legacy';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
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
	import { showError, showSuccess } from '$lib/utils/showToast';
	import { Check, Download, Trash, Upload } from 'lucide-svelte';
	import { openFilePreview } from '$lib/utils/functions';
	import { cn } from '$lib/utils';
	import { format } from 'date-fns';

	interface Props {
		employee: any;
	}

	let { employee = $bindable() }: Props = $props();
	let docs: any[] = $state([]);
	let newDoc = $state({
		file: null,
		score: 0,
		date: ''
	});

	async function fetchData() {
		docs = (await api.get('/employees/evaluations/' + employee.id)).data || [];
	}

	async function openPreview(url: string, date: string) {
		await openFilePreview(
			url,
			'Evaluacion ' +
				date +
				' de ' +
				employee.name +
				' ' +
				employee.paternalLastName +
				' ' +
				employee.maternalLastName
		);
	}

	async function uploadNewDocument() {
		if (!newDoc.file || !newDoc.file?.[0]) return showError(null, 'Selecciona un documento');
		const form = new FormData();
		form.append(
			'json',
			JSON.stringify({ employeeId: employee.id, score: Number(newDoc.score), date: newDoc.date })
		);
		form.append('file', newDoc.file[0]);
		await api.post('/employees/evaluations', form);

		newDoc = {
			file: null,
			score: 0,
			date: ''
		};

		showSuccess('Documento subido');
		fetchData();
	}

	async function deleteDocument(id: string) {
		await api.delete('/employees/evaluations/' + id);
		showSuccess('Documento eliminado');
		fetchData();
	}

	run(() => {
		if (employee.id) fetchData();
	});
</script>

<Table>
	<TableHeader class="sticky top-0 border-t">
		<TableHead class="w-[60%] border-l">Fecha</TableHead>
		<TableHead class="w-[60%] border-l">Calificación (0-100)</TableHead>
		<TableHead colspan={2}></TableHead>
	</TableHeader>
	<TableBody>
		{#each docs as row}
			<TableRow>
				<TableCell class={cn('border-l', !row.url && 'text-muted-foreground')}
					>{format(row.date, 'dd/MM/yyyy')}</TableCell
				>

				<TableCell>
					{row.score}
				</TableCell>
				<TableCell class="p-0">
					<Button
						class="aspect-square rounded-none"
						variant="ghost"
						onclick={() => openPreview(row.url, row.name)}><Download class="size-3.5" /></Button
					>
				</TableCell>
				<TableCell class="p-0">
					{#if row.url}
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Button class="aspect-square rounded-none" variant="ghost"
									><Trash class="size-3.5" /></Button
								>
								<DropdownMenuContent>
									<DropdownMenuItem onclick={() => deleteDocument(row.id)}
										>Eliminar</DropdownMenuItem
									>
								</DropdownMenuContent>
							</DropdownMenuTrigger>
						</DropdownMenu>
					{/if}</TableCell
				>
			</TableRow>
		{/each}
		<TableRow>
			<TableCell class="border-l p-0 px-[1px]"
				><Input type="date" class="rounded-none border-none" bind:value={newDoc.date} /></TableCell
			>
			<TableCell class="border-l p-0 px-[1px]"
				><Input
					accept="[0-9]"
					class="rounded-none border-none"
					bind:value={newDoc.score}
				/></TableCell
			>

			<TableCell class="w-min p-0">
				<label class="flex aspect-square h-8 cursor-pointer items-center justify-center">
					<Upload class={cn('size-3.5', newDoc?.file?.[0] && 'text-green-foreground')} />
					<input bind:files={newDoc.file} type="file" class="hidden" />
				</label>
			</TableCell>
			<TableCell class="p-0"
				><Button onclick={uploadNewDocument} class="h-full w-full rounded-none" variant="ghost"
					><Check class="size-3.5" /></Button
				></TableCell
			>
		</TableRow>
	</TableBody>
</Table>
