<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Dialog,
		DialogContent,
		DialogBody,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { getDayNumber } from '$lib/utils/functions';
	import api from '$lib/utils/server';
	import { showError, showSuccess } from '$lib/utils/showToast';

	interface Props {
		show: boolean;
		productivity: any[];
		areas: any[];
		reload: any;
	}

	let { show = $bindable(), productivity, areas, reload }: Props = $props();
	let selectedAreaId: string = $state('');
	let selectedRowId: string = $state('');
	let selectedDate = $state(new Date().toISOString().split('T')[0]);
	let areasList: { value: string; name: string }[] = $derived(
		Object.keys(areas)
			.map((areaId) => ({
				value: String(areaId),
				name: areas[Number(areaId)]
			}))
			.filter((area) => productivity.some((row: any) => row.areaId === area.value))
	);
	let employees: any[] = $derived(
		productivity
			.filter((row: any) => row.areaId === selectedAreaId)
			.map((row: any) => ({
				value: row.id,
				name: row.name
			}))
	);
	let dayNumber: number = $derived(getDayNumber(selectedDate));
	let noEmpleadoInput: any = $state(null);
	let code0Input: any = $state(null);
	let formData = $state({
		id: '',
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

	$effect(() => {
		if (!selectedRowId) {
			formData = {
				id: '',
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
			};
			return;
		}

		const selected = productivity.find((row: any) => row.id === selectedRowId);

		formData = {
			id: selected.id,
			code0: selected[dayNumber + 'code0'],
			code1: selected[dayNumber + 'code1'],
			code2: selected[dayNumber + 'code2'],

			goal0: selected[dayNumber + 'goal0'],
			goal1: selected[dayNumber + 'goal1'],
			goal2: selected[dayNumber + 'goal2'],

			produced0: selected[dayNumber + 'produced0'],
			produced1: selected[dayNumber + 'produced1'],
			produced2: selected[dayNumber + 'produced2'],

			comment: selected[dayNumber + 'comment']
		};
	});

	async function handleSubmit(negate: boolean = false) {
		if (!formData.id) return showError(null, 'Elige un empleado');

		if (negate) {
			await api.put('/productivity', {
				id: parseInt(formData.id),
				[`${dayNumber}code0`]: null,
				[`${dayNumber}code1`]: null,
				[`${dayNumber}code2`]: null,

				[`${dayNumber}goal0`]: null,
				[`${dayNumber}goal1`]: null,
				[`${dayNumber}goal2`]: null,

				[`${dayNumber}produced0`]: null,
				[`${dayNumber}produced1`]: null,
				[`${dayNumber}produced2`]: null,
				[`${dayNumber}comment`]: 'ANULADO'
			});
		} else {
			await api.put('/productivity', {
				id: parseInt(formData.id),
				[`${dayNumber}code0`]: formData.code0,
				[`${dayNumber}code1`]: formData.code1,
				[`${dayNumber}code2`]: formData.code2,

				[`${dayNumber}goal0`]: formData.goal0,
				[`${dayNumber}goal1`]: formData.goal1,
				[`${dayNumber}goal2`]: formData.goal2,

				[`${dayNumber}produced0`]: formData.produced0,
				[`${dayNumber}produced1`]: formData.produced1,
				[`${dayNumber}produced2`]: formData.produced2,
				[`${dayNumber}comment`]: formData.comment
			});
		}
		if (negate) showSuccess('Anulada');
		else showSuccess('Datos cambiados');

		noEmpleadoInput.focus();
		noEmpleadoInput.value = '';

		await reload();
	}

	function handleNoEmpleado(e: any) {
		productivity.forEach((row: any) => {
			if (row.noEmpleado === e.target.value) {
				selectedRowId = row.id;
				selectedAreaId = row.areaId;
				code0Input.focus();
			}
		});
	}

	function getColors(number?: number) {
		if (isNaN(number || NaN) || !number) return 'outline';
		if (number < 0.51) return 'red';
		if (number < 1) return 'yellow';
		if (number < 1.5) return 'green';
		return 'blue';
	}
</script>

<Dialog bind:open={show}>
	<DialogContent
		onkeydown={(e) => {
			if (e.ctrlKey && e.key === 'Delete') handleSubmit(true);
			if (e.ctrlKey && e.key === 'Enter') handleSubmit();
		}}
	>
		<DialogHeader title="Captura de produccion" />
		<DialogBody>
			<form class="grid w-full gap-0.5">
				<div class="grid text-sm">
					<div class="grid grid-cols-[10rem_1fr]">
						<Input
							type="date"
							class="rounded-b-none rounded-r-none border-b-0 border-r-0"
							bind:value={selectedDate}
						></Input>
						<Select
							placeholder="Area"
							class="rounded-b-none rounded-l-none border-b-0"
							items={areasList}
							bind:value={selectedAreaId}
							onValueChange={() => {
								selectedRowId = '';
							}}
						/>
						<Input
							type="number"
							id="noEmpleado"
							class="rounded-r-none rounded-t-none border-r-0"
							onchange={handleNoEmpleado}
							placeholder="No.Empleado"
							bind:ref={noEmpleadoInput}
						></Input>
						<Select
							placeholder="Empleado"
							class="rounded-l-none rounded-t-none"
							items={employees}
							bind:value={selectedRowId}
						/>
					</div>

					<div class="my-4 grid grid-cols-[2fr_1fr_1fr] gap-y-1">
						<span>Codigo</span>
						<span>Meta</span>
						<span>Producido</span>

						<Input class="rounded-r-none" bind:ref={code0Input} bind:value={formData.code0}></Input>
						<Input class="rounded-none" bind:value={formData.goal0} type="number"></Input>
						<Input class="rounded-l-none" bind:value={formData.produced0} type="number"></Input>

						<Input class="rounded-r-none" bind:value={formData.code1}></Input>
						<Input class="rounded-none" bind:value={formData.goal1} type="number"></Input>
						<Input class="rounded-l-none" bind:value={formData.produced1} type="number"></Input>

						<Input class="rounded-r-none" bind:value={formData.code2}></Input>
						<Input class="rounded-none" bind:value={formData.goal2} type="number"></Input>
						<Input class="rounded-l-none" bind:value={formData.produced2} type="number"></Input>
					</div>
					<span>Comentario</span>
					<Input bind:value={formData.comment}></Input>
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
			</form>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
