<script lang="ts">
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogBody } from '$lib/components/ui/dialog';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import { CircleAlert } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { quitReasons, quitStatus } from './employees.options';

	interface Props {
		show?: boolean;
		selectedEmployee: any;
	}

	let { show = $bindable(false), selectedEmployee = $bindable({}) }: Props = $props();

	let formData: any = $state({
		id: selectedEmployee.id,
		quitReason: null,
		quitDate: '',
		quitNotes: '',
		quitStatus: '',
		resignationDate: '',
		lastDay: '',
		formatDate: ''
	});

	async function handleSubmmit() {
		await api.delete('/employees', {
			data: { ...formData, id: parseInt(selectedEmployee.id || '0') }
		});

		show = false;
		showSuccess('Empleado dado de baja');
		formData = {
			id: '',
			quitReason: null,
			quitDate: '',
			quitNotes: '',
			quitStatus: '',
			resignationDate: '',
			lastDay: '',
			formatDate: ''
		};
	}

	onMount(() => {
		show = false;
		refetch(['employees']);
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogBody>
			<div class="text-center">
				<CircleAlert class="mx-auto mb-2 h-16 w-16 text-gray-400 dark:text-gray-200" />
				<h3 class=" text-lg font-normal text-gray-500 dark:text-gray-400">Dar de baja a:</h3>
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
					<span>Razon</span>
					<Select class="mt-2" items={quitReasons} bind:value={formData.quitReason} />
				</b>
				<b class="space-y-2">
					<span>Fecha de baja</span>
					<Input type="date" bind:value={formData.quitDate} />
				</b>
				<b class="space-y-2">
					<span>Fecha de renuncia</span>
					<Input type="date" bind:value={formData.resignationDate} />
				</b>
				<b class="space-y-2">
					<span>Ultimo dia</span>
					<Input type="date" bind:value={formData.lastDay} />
				</b>
				<b class="space-y-2">
					<span>Status</span>
					<Select class="mt-2" items={quitStatus} bind:value={formData.quitStatus} />
				</b>
				<b class="space-y-2">
					<span>Notas</span>
					<Input bind:value={formData.quitNotes} />
				</b>
				<div class="text-center">
					<Button onclick={handleSubmmit} class="me-2" variant="destructive">Dar de baja</Button>
					<Button onclick={() => (show = false)} variant="outline">Cancelar</Button>
				</div>
			</form>
		</DialogBody>
	</DialogContent>
</Dialog>
