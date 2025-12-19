<script lang="ts">
	import { run } from 'svelte/legacy';

	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Label from '$lib/components/basic/Label.svelte';
	import MaterialInput from '$lib/components/basic/MaterialInput.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Dialog, DialogBody, DialogContent, DialogHeader } from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';

	interface Props {
		show: boolean;
	}

	let { show = $bindable() }: Props = $props();

	let selected = $state('');
	let formData: any = $state({});

	run(() => {
		if (!show) formData = {};
	});

	async function submit() {
		await api.post(`/materialmovements/${selected}`, formData);
		refetch(['material-movements']);
		show = false;
		showSuccess(`Movimiento registrado`);
	}
</script>

<Dialog bind:open={show}>
	<DialogContent class="max-w-lg">
		<DialogHeader>
			<Tabs.Root bind:value={selected} class="w-full">
				<Tabs.List class="grid w-full grid-cols-5">
					<Tabs.Trigger value="reposition">Reposicion</Tabs.Trigger>
					<Tabs.Trigger value="leftover">Sobrante</Tabs.Trigger>
					<Tabs.Trigger value="supplies">Insumos</Tabs.Trigger>
					<Tabs.Trigger value="return">Retorno</Tabs.Trigger>
					<Tabs.Trigger value="scrap">Scrap</Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</DialogHeader>

		<DialogBody>
			<div class="grid w-full gap-4">
				{#if selected === 'reposition' || selected === 'leftover'}
					<Label name="Job - PO">
						<Input bind:value={formData.job} />
					</Label>
				{/if}
				<Label name="Codigo">
					<MaterialInput normal bind:value={formData.code} />
				</Label>
				<Label name="Cantidad">
					<Input bind:value={formData.amount} />
				</Label>
			</div>

			<Button onclick={submit} variant="default" class="mt-4 w-full">Guardar cambios</Button>
		</DialogBody>
	</DialogContent>
</Dialog>
