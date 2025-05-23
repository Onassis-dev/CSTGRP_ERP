<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogBody } from '$lib/components/ui/dialog';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { CircleAlert } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { salaryReasons } from './employees.options';

	interface Props {
		show?: boolean;
		selectedEmployee: any;
		reload: any;
	}

	let { show = $bindable(false), selectedEmployee = $bindable({}), reload }: Props = $props();

	let formData = $state({
		id: selectedEmployee.id,
		salaryReason: '',
		reasonComment: '',
		newSalary: '',
		changeDate: '',
		petitioner: '',
		comments: '',
		formatDate: ''
	});

	async function handleSubmmit() {
		await api.put('/employees/salary', {
			...formData,
			id: Number(selectedEmployee.id || '0')
		});

		show = false;
		showSuccess('Salario actualizado');
		formData = {
			id: selectedEmployee.id,
			salaryReason: '',
			reasonComment: '',
			newSalary: '',
			changeDate: '',
			petitioner: '',
			comments: '',
			formatDate: ''
		};
	}

	onMount(() => {
		show = false;
		reload();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogBody>
			<div class="text-center">
				<CircleAlert class="mx-auto mb-2 h-16 w-16 text-gray-400 dark:text-gray-200" />
				<h3 class=" text-lg font-normal text-gray-500 dark:text-gray-400">Actualizar salario:</h3>
				<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
					{selectedEmployee.name} - {selectedEmployee.noEmpleado}
				</h3>
			</div>
			<form class="flex flex-col space-y-6" action="#">
				<b class="space-y-2">
					<span>Fecha del formato</span>
					<Input type="date" bind:value={formData.formatDate} />
				</b>
				<b class="space-y-2">
					<span>Motivo</span>
					<Select class="mt-2" items={salaryReasons} bind:value={formData.salaryReason} />
				</b>
				<b class="space-y-2">
					<span>Comentario (opcional)</span>
					<Input type="text" bind:value={formData.reasonComment} />
				</b>
				<b class="space-y-2">
					<span>Fecha de modificacion</span>
					<Input type="date" bind:value={formData.changeDate} />
				</b>
				<b class="space-y-2">
					<span>Nuevo salario</span>
					<Input type="number" bind:value={formData.newSalary} />
				</b>
				<b class="space-y-2">
					<span>Solicitante</span>
					<Input type="text" bind:value={formData.petitioner} />
				</b>
				<b class="space-y-2">
					<span>Observaciones</span>
					<Input type="text" bind:value={formData.comments} />
				</b>
				<div class="text-center">
					<Button onclick={handleSubmmit} class="me-2" variant="destructive">Actualizar</Button>
					<Button onclick={() => (show = false)} variant="outline">Cancelar</Button>
				</div>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
