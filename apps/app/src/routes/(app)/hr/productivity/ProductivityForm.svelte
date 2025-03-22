<script lang="ts">
	import { run, createBubbler, preventDefault } from 'svelte/legacy';
	const bubble = createBubbler();
	import Select from '$lib/components/basic/Select.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Dialog,
		DialogContent,
		DialogBody,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { getDayNumber } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';

	interface Props {
		show: boolean;
		productivity: any[];
		areas: any[];
		reload: any;
	}

	let { show = $bindable(), productivity, areas, reload }: Props = $props();
	let selectedRowId: string = $state('');
	let selectedAreaId: string = $state('');
	let selectedRow: any;
	let selectedDate = $state(new Date().toISOString().split('T')[0]);
	let areasList: any[] = $state([]);
	let employees: any[] = $state([]);
	let dayNumber: number = getDayNumber(selectedDate);

	let formData = $state({
		code0: '',
		code1: '',
		code2: '',
		goal0: '',
		goal1: '',
		goal2: '',
		produced0: '',
		produced1: '',
		produced2: '',
		comment: ''
	});

	async function handleSubmit() {
		await api.put('/productivity', {
			id: parseInt(selectedRow.id),
			[`${dayNumber}code0`]: formData['code0'],
			[`${dayNumber}code1`]: formData['code1'],
			[`${dayNumber}code2`]: formData['code2'],

			[`${dayNumber}goal0`]: formData['goal0'],
			[`${dayNumber}goal1`]: formData['goal1'],
			[`${dayNumber}goal2`]: formData['goal2'],

			[`${dayNumber}produced0`]: formData['produced0'],
			[`${dayNumber}produced1`]: formData['produced1'],
			[`${dayNumber}produced2`]: formData['produced2'],
			[`${dayNumber}comment`]:
				(formData['comment'] || '').toUpperCase() === 'Anulado'.toUpperCase()
					? ''
					: formData['comment']
		});
		showSuccess('Datos cambiados');
		document.querySelector<HTMLInputElement>('.xxx')?.focus();

		await reload();
	}

	async function handleNegate(event: any) {
		if (!(event.ctrlKey && event.key === 'Enter')) return;

		await api.put('/productivity', {
			id: parseInt(selectedRow.id),
			[`${dayNumber}code0`]: '',
			[`${dayNumber}code1`]: '',
			[`${dayNumber}code2`]: '',

			[`${dayNumber}goal0`]: '',
			[`${dayNumber}goal1`]: '',
			[`${dayNumber}goal2`]: '',

			[`${dayNumber}produced0`]: '',
			[`${dayNumber}produced1`]: '',
			[`${dayNumber}produced2`]: '',

			[`${dayNumber}comment`]: 'Anulado'
		});
		showSuccess('Anulada');

		document.querySelector<HTMLInputElement>('.xxx')?.focus();
		await reload();
	}

	function selectArea() {
		employees = [];
		productivity[parseInt(selectedAreaId)].map((row: any) => {
			employees.push({
				value: row.id,
				name: row.name
			});
		});
	}

	function handleDateSelect() {
		dayNumber = getDayNumber(selectedDate);
		selectedRow = productivity[parseInt(selectedAreaId)].filter(
			(row: any) => row.id === selectedRowId
		)[0];

		formData = {
			code0: selectedRow[dayNumber + 'code0'],
			code1: selectedRow[dayNumber + 'code1'],
			code2: selectedRow[dayNumber + 'code2'],

			goal0: selectedRow[dayNumber + 'goal0'],
			goal1: selectedRow[dayNumber + 'goal1'],
			goal2: selectedRow[dayNumber + 'goal2'],

			produced0: selectedRow[dayNumber + 'produced0'],
			produced1: selectedRow[dayNumber + 'produced1'],
			produced2: selectedRow[dayNumber + 'produced2'],

			comment: selectedRow[dayNumber + 'comment']
		};
	}

	function handleNoEmpleado(e: any) {
		Object.keys(productivity).forEach((areaId) => {
			productivity[parseInt(areaId)].forEach((row: any) => {
				if (row.noEmpleado === e.target.value) {
					selectedRowId = row.id;
					selectedAreaId = row.areaId;
				}
			});
		});
	}

	function getColors(number?: number) {
		if (isNaN(number || NaN) || !number) return 'default';
		if (number < 0.51) return 'red';
		if (number < 1) return 'yellow';
		if (number < 1.5) return 'green';
		return 'blue';
	}
	run(() => {
		if (productivity) {
			areasList = [];
			Object.keys(productivity).forEach((areaId) => {
				areasList.push({
					value: areaId,
					name: areas[parseInt(areaId)]
				});
			});
		}
	});
	run(() => {
		if (selectedAreaId) selectArea();
	});
	run(() => {
		if (selectedRowId && selectedDate) handleDateSelect();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Captura de produccion</DialogTitle>
		</DialogHeader>
		<DialogBody>
			<div class="grid w-full gap-0.5" onkeydown={handleNegate} role="button" tabindex="0">
				<div class="flex items-center justify-end gap-2">
					<span class="w-[20%] text-right">Fecha</span>
					<Input class="w-[80%]" type="date" bind:value={selectedDate}></Input>
				</div>
				<div class="flex items-center justify-end gap-2">
					<span class="w-[20%] text-right">Area</span>
					<Select class="w-[80%]" items={areasList} bind:value={selectedAreaId} />
				</div>
				<div class="flex items-center justify-end gap-2">
					<span class="w-[20%] text-right">No.Empleado</span>
					<Input class="xxx w-[80%]" type="number" onchange={handleNoEmpleado}></Input>
				</div>
				<div class="flex items-center justify-end gap-2">
					<span class="w-[20%] text-right">Nombre</span>
					<Select class="w-[80%]" items={employees} bind:value={selectedRowId} />
				</div>

				<div class="my-2"></div>

				<form onsubmit={preventDefault(bubble('submit'))} class="grid w-full gap-0.5">
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Codigo1</span>
						<Input bind:value={formData.code0} class="w-[80%]"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Meta</span>
						<Input bind:value={formData.goal0} class="w-[80%]" type="number"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Producido</span>
						<Input bind:value={formData.produced0} class="w-[80%]" type="number"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Codigo2</span>
						<Input bind:value={formData.code1} class="w-[80%]"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Meta</span>
						<Input bind:value={formData.goal1} class="w-[80%]" type="number"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Producido</span>
						<Input bind:value={formData.produced1} class="w-[80%]" type="number"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Codigo3</span>
						<Input bind:value={formData.code2} class="w-[80%]"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Meta</span>
						<Input bind:value={formData.goal2} class="w-[80%]" type="number"></Input>
					</div>
					<div class="flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Producido</span>
						<Input bind:value={formData.produced2} class="w-[80%]" type="number"></Input>
					</div>
					<div class="my-1 flex items-center justify-end gap-2">
						<span class="w-[20%] text-right">Comentario</span>
						<Input bind:value={formData.comment} class="w-[80%]"></Input>
					</div>

					<div class="grid grid-cols-3 gap-1">
						<Badge color={getColors(parseInt(formData.produced0) / parseInt(formData.goal0))}
							>{(parseInt(formData.produced0) / parseInt(formData.goal0)) * 100 || ''}%</Badge
						>
						<Badge color={getColors(parseInt(formData.produced1) / parseInt(formData.goal1))}
							>{(parseInt(formData.produced1) / parseInt(formData.goal1)) * 100 || ''}%</Badge
						>
						<Badge color={getColors(parseInt(formData.produced2) / parseInt(formData.goal2))}
							>{(parseInt(formData.produced2) / parseInt(formData.goal2)) * 100 || ''}%</Badge
						>
					</div>
					<Badge
						color={getColors(
							((parseInt(formData.produced0) / parseInt(formData.goal0) || 0) +
								(parseInt(formData.produced1) / parseInt(formData.goal1) || 0) +
								(parseInt(formData.produced2) / parseInt(formData.goal2) || 0)) /
								(formData.goal2 ? 3 : formData.goal1 ? 2 : formData.goal0 ? 1 : 1)
						)}
						>{Math.round(
							(((parseInt(formData.produced0) / parseInt(formData.goal0) || 0) +
								(parseInt(formData.produced1) / parseInt(formData.goal1) || 0) +
								(parseInt(formData.produced2) / parseInt(formData.goal2) || 0)) *
								100) /
								(formData.goal2 ? 3 : formData.goal1 ? 2 : formData.goal0 ? 1 : 1)
						)}%</Badge
					>

					<Button onclick={handleSubmit} type="submit" class="mt-4 w-full">Guardar</Button>
				</form>
			</div>
		</DialogBody>
	</DialogContent>
</Dialog>
