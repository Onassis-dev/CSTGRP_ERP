<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { formatDate } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import Cookies from 'js-cookie';
	import { refetch } from '$lib/utils/query';
	import { getOptions, getProdAreas } from '$lib/utils/queries';
	import { createQuery } from '@tanstack/svelte-query';
	import { untrack } from 'svelte';

	interface Props {
		show?: boolean;
		selectedMovement: any;
	}

	let { show = $bindable(false), selectedMovement = $bindable() }: Props = $props();
	let formData: any = $state({});
	let jobs: any[] = $state([]);

	async function setFormData() {
		formData = { ...selectedMovement };
		formData.petitioner = Cookies.get('username');
		await getJobs();
	}

	async function getJobs() {
		jobs = [];
		jobs = (
			await api.get('requisitions/jobs', {
				params: {
					code: selectedMovement.code
				}
			})
		).data;
	}

	const areasQuery = createQuery({
		queryKey: ['requisitions-areas'],
		queryFn: getProdAreas
	});

	async function handleSubmit() {
		await api.post(
			'requisitions',
			{
				...formData,
				jobIds: jobs.filter((v) => v.selected).map((v) => v.id)
			},
			{ responseType: 'arraybuffer' }
		);

		refetch(['requisitions']);
		showSuccess('Requisicion registrada');
		show = false;
	}

	const motives = [
		{ name: 'Producción', value: 'Producción' },
		{ name: 'Empaque', value: 'Empaque' },
		{ name: 'Corte de tela', value: 'Corte de tela' },
		{ name: 'Cortes varios', value: 'Cortes varios' }
	];

	$effect(() => {
		if (show) untrack(() => setFormData());
	});

	$effect(() => {
		formData.necessary = jobs.reduce((prev, v) => (v.selected ? prev + Number(v.amount) : prev), 0);
	});
</script>

<Dialog bind:open={show}>
	<DialogContent class="grid min-h-[90%] grid-rows-[auto_1fr] gap-4 sm:max-w-4xl">
		<DialogHeader title={`Requerir ${selectedMovement?.code}`} />
		<DialogBody>
			<div class="mb-4 grid w-full gap-4 sm:grid-cols-3">
				<Label name="Solicitante:">
					<Input bind:value={formData.petitioner} />
				</Label>
				<Label name="Motivo:">
					<Select items={motives} bind:value={formData.motive} />
				</Label>
				<Label name="Area:">
					<Select items={getOptions($areasQuery.data)} bind:value={formData.areaId} />
				</Label>
				<Label name="Material necesario total:">
					<Input
						disabled
						value={formData.necessary + ' ' + formData.measurement}
						class="disabled:opacity-100"
					/>
				</Label>
				<Label name="Material requerido:" class="sm:col-span-2">
					<Input bind:value={formData.requested} />
				</Label>
			</div>

			<Table>
				<TableHeader class="sticky top-0 border-t">
					<TableHead class="border-l">Programacion</TableHead>
					<TableHead>Job</TableHead>
					<TableHead>Due</TableHead>
					<TableHead>Cantidad</TableHead>
					<TableHead class="w-min max-w-2"></TableHead>
				</TableHeader>
				<TableBody>
					{#each jobs as row, i}
						<TableRow>
							<TableCell class="border-l">{row.programation}</TableCell>
							<TableCell>{row.jobpo}</TableCell>
							<TableCell>{formatDate(row.due)}</TableCell>
							<TableCell>{row.amount}</TableCell>
							<TableCell class="w-min max-w-2">
								<Checkbox bind:checked={jobs[i].selected} />
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
