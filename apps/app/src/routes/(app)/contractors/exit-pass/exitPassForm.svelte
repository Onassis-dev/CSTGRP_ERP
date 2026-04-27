<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showError, showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import { untrack } from 'svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { getContractors, getOptions } from '$lib/utils/queries';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Trash } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	type ApiLikeError = {
		response?: { data?: { message?: string }; status?: number };
	};

	interface Props {
		show?: boolean;
		selectedExitPass: any;
	}

	let { show = $bindable(false), selectedExitPass = $bindable({}) }: Props = $props();

	interface AvailableJob {
		id: number;
		ref: string;
		amount: number | string;
		contractorAmount?: number | string;
		code: string;
	}

	interface JobRow {
		jobId: number | '';
		contractorAmount: string;
		search: string;
		popoverOpen: boolean;
	}

	let formData: any = $state({
		contractorId: '',
		date: ''
	});

	let jobRows: JobRow[] = $state([]);
	let passJobsSnapshot: AvailableJob[] = $state([]);

	const contractors = createQuery({
		queryKey: ['contractors'],
		queryFn: getContractors
	});
	const contractorsQuery = $derived(getOptions($contractors.data));

	const jobsQuery = createQuery({
		queryKey: ['contractors-exit-pass-jobs'],
		queryFn: async () => (await api.get('/contractors/exit-pass/available-jobs')).data
	});

	const jobsCatalog = $derived.by(() => {
		const avail = ($jobsQuery.data ?? []) as AvailableJob[];
		const byId = new Map<number, AvailableJob>();
		for (const j of passJobsSnapshot) byId.set(j.id, j);
		for (const j of avail) if (!byId.has(j.id)) byId.set(j.id, j);
		return [...byId.values()];
	});

	function jobById(id: number | ''): AvailableJob | undefined {
		if (id === '') return undefined;
		return jobsCatalog.find((j) => j.id === id);
	}

	function jobsForPicker(rowIndex: number) {
		const row = jobRows[rowIndex];
		if (!row) return [];
		const q = (row.search ?? '').toLowerCase();
		const taken = new Set(
			jobRows
				.map((r, idx) => (idx !== rowIndex && r.jobId !== '' ? Number(r.jobId) : null))
				.filter((x): x is number => x != null)
		);
		return jobsCatalog
			.filter(
				(j) =>
					(!taken.has(j.id) || j.id === row.jobId) &&
					String(j.ref ?? '')
						.toLowerCase()
						.includes(q)
			)
			.slice(0, 50);
	}

	function addJobRow() {
		jobRows.push({
			jobId: '',
			contractorAmount: '',
			search: '',
			popoverOpen: false
		});
		jobRows = jobRows;
	}

	function deleteJobRow(i: number) {
		jobRows.splice(i, 1);
		jobRows = jobRows;
	}

	async function setFormData() {
		formData = { ...selectedExitPass, date: selectedExitPass.date.split('T')[0] };
		if (selectedExitPass?.id) {
			try {
				const data = (await api.get(`/contractors/exit-pass/${selectedExitPass.id}/jobs`))
					.data as AvailableJob[];
				passJobsSnapshot = Array.isArray(data) ? data : [];
				jobRows = passJobsSnapshot.map((j) => ({
					jobId: j.id,
					contractorAmount: String(j.contractorAmount ?? ''),
					search: j.ref ?? '',
					popoverOpen: false
				}));
				if (!jobRows.length) addJobRow();
			} catch (e) {
				showError(e as ApiLikeError);
				passJobsSnapshot = [];
				jobRows = [{ jobId: '', contractorAmount: '', search: '', popoverOpen: false }];
			}
		} else {
			passJobsSnapshot = [];
			jobRows = [{ jobId: '', contractorAmount: '', search: '', popoverOpen: false }];
		}
	}

	async function handleSubmit() {
		const jobs = jobRows
			.filter((r) => r.jobId !== '' && r.contractorAmount !== '')
			.map((r) => ({
				id: Number(r.jobId),
				contractorAmount: Math.round(Number(r.contractorAmount))
			}));
		if (!jobs.length) {
			showError(null, 'Añade al menos un job con cantidad de contratista');
			return;
		}
		if (jobs.some((j) => !Number.isFinite(j.contractorAmount) || j.contractorAmount <= 0)) {
			showError(null, 'La cantidad de contratista debe ser mayor a 0');
			return;
		}
		const body = {
			contractorId: formData?.contractorId,
			date: formData.date,
			jobs
		};
		try {
			if (formData.id) {
				await api.put('/contractors/exit-pass', { ...body, id: formData.id });
				showSuccess('Pase editado');
			} else {
				await api.post('/contractors/exit-pass', body);
				showSuccess('Pase registrado');
			}
			refetch(['contractors-exit-pass']);
			refetch(['contractors-exit-pass-jobs']);
			show = false;
		} catch (e) {
			showError(e as ApiLikeError);
		}
	}

	$effect(() => {
		if (!show) return;
		untrack(() => {
			void setFormData();
		});
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="sm:max-w-3xl">
		<DialogHeader
			title={formData?.id ? 'Pase de salida #' + formData.folio : 'Registrar pase de salida'}
		/>

		<DialogBody class="flex max-h-[85vh] flex-col gap-4 overflow-auto">
			<div class="grid w-full gap-2 sm:grid-cols-2">
				<Label name="Contratista">
					<Select items={contractorsQuery} bind:value={formData.contractorId} />
				</Label>
				<Label name="Fecha">
					<Input type="date" bind:value={formData.date} />
				</Label>
			</div>

			<div class="flex flex-col gap-2">
				<span class="text-sm font-medium leading-none">Jobs</span>
				<Table divClass="h-auto overflow-visible">
					<TableHeader>
						<TableHead class="w-1/3">Job</TableHead>
						<TableHead class="w-full">Parte</TableHead>
						<TableHead class="">Cantidad</TableHead>
						<TableHead class="">Cant. contratista</TableHead>
						<TableHead class="w-1 p-0"></TableHead>
					</TableHeader>
					<TableBody>
						{#each jobRows as _, i}
							<TableRow>
								<TableCell class="p-0 px-[1px]">
									<Popover.Root bind:open={jobRows[i].popoverOpen}>
										<Command.Root shouldFilter={false}>
											<Popover.Trigger>
												<Input
													class="rounded-none border-none !opacity-100"
													type="text"
													autocomplete="off"
													bind:value={jobRows[i].search}
													oninput={() => {
														jobRows[i].jobId = '';
														jobRows = [...jobRows];
													}}
												/>
											</Popover.Trigger>
											<Popover.Content
												class="min-w-[12rem] p-0 sm:min-w-[16rem]"
												trapFocus={false}
												onOpenAutoFocus={(e) => e.preventDefault()}
												onCloseAutoFocus={(e) => e.preventDefault()}
											>
												<Command.List class="max-h-48">
													<Command.Empty>Sin resultados</Command.Empty>
													<Command.Group>
														{#each jobsForPicker(i) as job (job.id)}
															<Command.Item
																value={String(job.id)}
																onSelect={() => {
																	jobRows[i].jobId = job.id;
																	jobRows[i].search = job.ref ?? '';
																	jobRows[i].popoverOpen = false;
																	jobRows = [...jobRows];
																}}
															>
																{job.ref}
															</Command.Item>
														{/each}
													</Command.Group>
												</Command.List>
											</Popover.Content>
										</Command.Root>
									</Popover.Root>
								</TableCell>
								<TableCell class="border-l px-2 text-sm tabular-nums">
									{jobById(jobRows[i].jobId)?.code ?? ''}
								</TableCell>
								<TableCell class="border-l px-2 text-sm tabular-nums">
									{jobById(jobRows[i].jobId)?.amount ?? ''}
								</TableCell>
								<TableCell class="p-0 px-[1px]">
									<Input
										class="rounded-none border-none !opacity-100"
										type="text"
										inputmode="numeric"
										bind:value={jobRows[i].contractorAmount}
									/>
								</TableCell>
								<TableCell class="flex h-8 justify-center p-0 px-[1px]">
									<Button
										onclick={() => deleteJobRow(i)}
										variant="ghost"
										class="aspect-square p-1 text-destructive-foreground"
										type="button"
									>
										<Trash class="size-5" />
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
				<Button onclick={addJobRow} class="mx-auto w-fit" type="button">Agregar job</Button>
			</div>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
