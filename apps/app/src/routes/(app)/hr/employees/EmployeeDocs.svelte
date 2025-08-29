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
	import { Check, FileDown, Trash, Upload } from 'lucide-svelte';
	import { downloadFile, openFilePreview } from '$lib/utils/functions';
	import { cn } from '$lib/utils';
	import { format } from 'date-fns';
	import { es } from 'date-fns/locale';
	interface Props {
		employee: any;
	}

	let { employee = $bindable() }: Props = $props();
	let docs: any[] = $state([]);
	let newDoc = $state({
		name: '',
		file: null
	});

	let predefinedDocs = [
		'Formato de alta',
		'Alta del IDSE',
		'Solicitud elaborada',
		'Formatos de contratacion',
		'Examen medico',
		'ACTA DE NACIMIENTO',
		'CURP',
		'INE VIGENTE',
		'COMPROBANTE DE DOMICILIO',
		'COMPROBANTE DE ESTUDIOS',
		'RFC',
		'NSS'
	];

	async function fetchData() {
		const serverDocs: any[] = (await api.get('/employees/documents/' + employee.id)).data || [];

		docs = [];
		predefinedDocs.forEach((name) => {
			const index = serverDocs.findIndex((v) => v.name === name);
			if (index !== -1) {
				docs.push(serverDocs[index]);
				serverDocs.splice(index, 1);
			} else {
				docs.push({ name });
			}
		});

		docs = [...docs, ...serverDocs];
	}

	async function openPreview(url: string, name: string) {
		await openFilePreview(
			url,
			name + '_' + employee.name + ' ' + employee.paternalLastName + ' ' + employee.maternalLastName
		);
	}

	async function downloadContract(number: number) {
		const contract = await api.get('/employees/documents/contract/' + employee.id + '/' + number, {
			responseType: 'blob'
		});

		const url = URL.createObjectURL(new Blob([contract.data], { type: 'application/pdf' }));
		window.open(url, '_blank');
		URL.revokeObjectURL(url);
	}

	async function downloadApplication() {
		const contract = await api.get('/employees/documents/application/' + employee.id, {
			responseType: 'blob'
		});

		const url = URL.createObjectURL(new Blob([contract.data], { type: 'application/pdf' }));
		window.open(url, '_blank');
		URL.revokeObjectURL(url);
	}

	async function downloadCredential() {
		const credential = await api.get('/employees/documents/credential/' + employee.id, {
			responseType: 'blob'
		});

		const url = URL.createObjectURL(new Blob([credential.data], { type: 'image/jpeg' }));
		const a = document.createElement('a');
		a.href = url;

		a.download = 'cr' + employee.noEmpleado + '.jpg';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function downloadDoc(url: string, name: string) {
		await downloadFile(
			url,
			name + '_' + employee.name + ' ' + employee.paternalLastName + ' ' + employee.maternalLastName
		);
	}

	async function uploadNewDocument() {
		if (!newDoc.file || !newDoc.file?.[0]) return showError(null, 'Selecciona un documento');
		const form = new FormData();
		form.append('json', JSON.stringify({ name: newDoc.name, employeeId: employee.id }));
		form.append('file', newDoc.file[0]);
		await api.post('/employees/documents', form);

		newDoc = {
			name: '',
			file: null
		};

		showSuccess('Documento subido');
		fetchData();
	}

	async function uploadDocument(file: any, name: string, id?: string) {
		if (!file) return showError(null, 'Selecciona un documento');
		const form = new FormData();
		form.append('file', file);

		if (id) {
			form.append('json', JSON.stringify({ name: name, id: id.toString() }));
			await api.put('/employees/documents', form);
		} else {
			form.append('json', JSON.stringify({ name: name, employeeId: employee.id }));
			await api.post('/employees/documents', form);
		}

		newDoc = {
			name: '',
			file: null
		};

		showSuccess('Documento subido');
		fetchData();
	}

	async function deleteDocument(id: string) {
		await api.delete('/employees/documents/' + id);
		showSuccess('Documento eliminado');
		fetchData();
	}

	run(() => {
		if (employee.id) fetchData();
	});

	function getIcon(url: string) {
		if (!url) return 'unknown.svg';
		if (url.includes('.pdf')) return 'pdf.svg';
		if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png')) return 'image.svg';
		if (url.includes('.doc') || url.includes('.docx')) return 'word.svg';
		if (url.includes('.xls') || url.includes('.xlsx')) return 'excel.svg';
		return 'file.svg';
	}

	const contracts = ['Primer', 'Segundo', 'Tercer', 'Último'];
</script>

<Table>
	<TableHeader class="sticky top-0 border-t">
		<TableHead class="w-full border-l">Nombre</TableHead>
		<TableHead class="w-full border-l">Actualizado</TableHead>
		<TableHead colspan={3}></TableHead>
	</TableHeader>
	<TableBody>
		<TableRow>
			<TableCell class={'cursor-pointer border-l'} onclick={downloadCredential}>
				<div class="flex items-center gap-3">
					<img src={`/image.svg`} alt={'Contrato'} class="size-4" />
					Credencial
				</div>
			</TableCell>
			<TableCell class={cn('border-l')}></TableCell>

			<TableCell class="p-0"></TableCell>
			<TableCell class="p-0">
				<Button
					onclick={downloadCredential}
					class="aspect-square h-full rounded-none p-0"
					variant="ghost"
				>
					<FileDown class="size-3.5" />
				</Button>
			</TableCell>
			<TableCell class="p-0"></TableCell>
		</TableRow>

		<TableRow>
			<TableCell class={'cursor-pointer border-l'} onclick={downloadApplication}>
				<div class="flex items-center gap-3">
					<img src={`/pdf.svg`} alt={'Contrato'} class="size-4" />
					Solicitud de empleo
				</div>
			</TableCell>
			<TableCell class={cn('border-l')}></TableCell>

			<TableCell class="p-0"></TableCell>
			<TableCell class="p-0">
				<Button
					onclick={downloadApplication}
					class="aspect-square h-full rounded-none p-0"
					variant="ghost"
				>
					<FileDown class="size-3.5" />
				</Button>
			</TableCell>
			<TableCell class="p-0"></TableCell>
		</TableRow>

		{#each contracts as contract, i}
			{#if new Date() >= new Date(employee.admissionDate).setDate(new Date(employee.admissionDate).getDate() + 30 * i - 4)}
				<TableRow>
					<TableCell class={'cursor-pointer border-l'} onclick={() => downloadContract(i)}>
						<div class="flex items-center gap-3">
							<img src={`/pdf.svg`} alt={'Contrato'} class="size-4" />
							{contract} Contrato
						</div>
					</TableCell>
					<TableCell class={cn('border-l')}></TableCell>

					<TableCell class="p-0"></TableCell>
					<TableCell class="p-0">
						<Button
							onclick={() => downloadContract(i)}
							class="aspect-square h-full rounded-none p-0"
							variant="ghost"
						>
							<FileDown class="size-3.5" />
						</Button>
					</TableCell>
					<TableCell class="p-0"></TableCell>
				</TableRow>
			{/if}
		{/each}

		{#each docs as row}
			<TableRow>
				<TableCell
					class={cn('border-l', !row.url && 'text-muted-foreground')}
					onclick={() => openPreview(row.url, row.name)}
				>
					<div class="flex items-center gap-3">
						<img src={`/${getIcon(row.url)}`} alt={row.name} class="size-4" />
						{row.name}
					</div>
				</TableCell>
				<TableCell class={cn('border-l')}>
					<div class="text-muted-foreground flex items-center gap-3">
						{#if row?.created_at}
							{format(new Date(row?.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
						{/if}
					</div>
				</TableCell>

				<TableCell class="p-0">
					<label
						class="flex aspect-square h-full w-auto cursor-pointer items-center justify-center"
					>
						<Upload class="size-3.5" />
						<input
							type="file"
							onchange={(e) => uploadDocument(e?.target?.files?.[0], row.name, row.id)}
							class="hidden"
						/>
					</label>
				</TableCell>
				<TableCell class="p-0">
					{#if row.url}
						<Button
							onclick={() => downloadDoc(row.url, row.name)}
							class="aspect-square h-full rounded-none p-0"
							variant="ghost"
						>
							<FileDown class="size-3.5" />
						</Button>
					{/if}
				</TableCell>
				<TableCell class="p-0">
					{#if row.url}
						<DropdownMenu>
							<DropdownMenuTrigger
								class="flex aspect-square h-full items-center justify-center rounded-none p-0"
							>
								<Trash class="size-3.5" />
								<DropdownMenuContent>
									<DropdownMenuItem onclick={() => deleteDocument(row.id)} class="text-red-500"
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
			<TableCell class="border-l px-[1px]" colspan={2}
				><Input class="rounded-none border-none" bind:value={newDoc.name} /></TableCell
			>

			<TableCell class="p-0">
				<label class="flex aspect-square h-full w-auto cursor-pointer items-center justify-center">
					<Upload class={cn('size-3.5', newDoc?.file?.[0] && 'text-green-foreground')} />
					<input bind:files={newDoc.file} type="file" class="hidden" />
				</label>
			</TableCell>
			<TableCell colspan={3} class="p-0"
				><Button onclick={uploadNewDocument} class="h-full w-full rounded-none" variant="ghost"
					><Check class="size-3.5" /></Button
				></TableCell
			>
		</TableRow>
	</TableBody>
</Table>
