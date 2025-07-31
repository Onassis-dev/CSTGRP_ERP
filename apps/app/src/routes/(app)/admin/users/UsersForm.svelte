<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import * as SelectBasic from '$lib/components/ui/select/index.js';
	import Select from '$lib/components/basic/Select.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogFooter,
		DialogHeader
	} from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { refetch } from '$lib/utils/query';
	import { getOptions } from '$lib/utils/queries';
	import { createQuery } from '@tanstack/svelte-query';
	import { baseUser } from './users.utils';

	interface Props {
		show?: boolean;
		selectedUser: any;
	}

	let { show = $bindable(false), selectedUser = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		const data = { ...selectedUser };
		Object.keys(baseUser.permissions).forEach((key) => {
			data.permissions[key] = parseInt(data.permissions[key] || '0');
		});
		formData = data;
	}

	const permissions = [
		{ value: 0, name: 'Ninguno', color: 'gray' },
		{ value: 1, name: 'Leer', color: 'green' },
		{ value: 2, name: 'Modificar', color: 'blue' }
	];

	const areasQuery = createQuery({
		queryKey: ['areas'],
		queryFn: async () => (await api.get('/hrvarious/areas')).data
	});
	let areas = $derived(getOptions($areasQuery.data));

	async function handleSubmit() {
		if (selectedUser.id) {
			if (formData.password === '') delete formData.password;
			await api.put('users', formData);
			showSuccess('Usuario actualizado');
		} else {
			await api.post('users', formData);
			showSuccess('Usuario registrado');
		}
		refetch(['users']);
		show = false;
	}

	$effect(() => {
		show;
		setFormData();
	});

	const cardClass = 'col-span-full grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-md border p-2';
</script>

<Dialog bind:open={show}>
	<DialogContent class="overflow-y-hidden">
		<DialogHeader
			title={selectedUser.id
				? `Editar información de ${selectedUser.username}`
				: 'Registrar usuario'}
		/>

		<DialogBody grid="2">
			<Label name="Nombre">
				<Input name="text" bind:value={formData.username} />
			</Label>
			<Label name="Contraseña">
				<Input name="text" bind:value={formData.password} />
			</Label>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">General</h3>
				<Label name="Perm. Usuarios">
					<Select items={permissions} bind:value={formData.permissions.users} />
				</Label>
				<Label name="Perm. Estructura">
					<Select items={permissions} bind:value={formData.permissions.structure} />
				</Label>
				<Label name="Perm. Formatos">
					<Select items={permissions} bind:value={formData.permissions.formats} />
				</Label>
				<Label name="Perm. Directorio">
					<Select items={permissions} bind:value={formData.permissions.directory} />
				</Label>
				<Label name="Perm. Documentos">
					<Select items={permissions} bind:value={formData.permissions.docs} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">Reportes</h3>
				<Label name="Perm. Reportes">
					<Select items={permissions} bind:value={formData.permissions.reports} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">RRHH</h3>
				<Label name="Perm. Empleados">
					<Select items={permissions} bind:value={formData.permissions.employees} />
				</Label>
				<Label name="Perm. Asistencia">
					<Select items={permissions} bind:value={formData.permissions.assistance} />
				</Label>
				<Label name="Perm. Productividad">
					<Select items={permissions} bind:value={formData.permissions.productivity} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">Producción</h3>
				<Label name="Perm. Corte">
					<Select items={permissions} bind:value={formData.permissions.prod_corte} />
				</Label>
				<Label name="Perm. Cortes Varios">
					<Select items={permissions} bind:value={formData.permissions.prod_cortesVarios} />
				</Label>
				<Label name="Perm. Producción">
					<Select items={permissions} bind:value={formData.permissions.prod_produccion} />
				</Label>
				<Label name="Perm. Calidad">
					<Select items={permissions} bind:value={formData.permissions.prod_calidad} />
				</Label>
				<Label name="Perm. Serigrafía">
					<Select items={permissions} bind:value={formData.permissions.prod_serigrafia} />
				</Label>
				<Label name="Perm. Movimientos">
					<Select items={permissions} bind:value={formData.permissions.prodmovements} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">Almacen</h3>
				<Label name="Perm. Inventario">
					<Select items={permissions} bind:value={formData.permissions.inventory} />
				</Label>
				<Label name="Perm. Movimientos">
					<Select items={permissions} bind:value={formData.permissions.materialmovements} />
				</Label>
				<Label name="Perm. Dashboard">
					<Select items={permissions} bind:value={formData.permissions.inventorystats} />
				</Label>
				<Label name="Perm. Requisiciones">
					<Select items={permissions} bind:value={formData.permissions.requisitions} />
				</Label>
				<Label name="Perm. Peticiones">
					<Select items={permissions} bind:value={formData.permissions.petitions} />
				</Label>
				<Label name="Perm. Po-Imp">
					<Select items={permissions} bind:value={formData.permissions.poimp} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">Sistemas</h3>
				<Label name="Perm. Sistemas">
					<Select items={permissions} bind:value={formData.permissions.it} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">Compras</h3>
				<Label name="Perm. Compras">
					<Select items={permissions} bind:value={formData.permissions.purchases} />
				</Label>
			</div>

			<div class={cardClass}>
				<h3 class="col-span-full w-full pl-0.5 font-semibold">Extras</h3>
				<Label name="Areas">
					<SelectBasic.Root
						type="multiple"
						name="assistance_areas"
						bind:value={formData.assistance_areas}
					>
						<SelectBasic.Trigger>Asistencia</SelectBasic.Trigger>
						<SelectBasic.Content>
							<SelectBasic.Group>
								{#each areas as area (area.value)}
									<SelectBasic.Item value={area.value} label={area.name}>
										{area.name}
									</SelectBasic.Item>
								{/each}
							</SelectBasic.Group>
						</SelectBasic.Content>
					</SelectBasic.Root>
				</Label>
				<Label name="Areas">
					<SelectBasic.Root type="multiple" name="prod_areas" bind:value={formData.prod_areas}>
						<SelectBasic.Trigger>Producción</SelectBasic.Trigger>
						<SelectBasic.Content>
							<SelectBasic.Group>
								{#each areas as area (area.value)}
									<SelectBasic.Item value={area.value} label={area.name}>
										{area.name}
									</SelectBasic.Item>
								{/each}
							</SelectBasic.Group>
						</SelectBasic.Content>
					</SelectBasic.Root>
				</Label>
				<Label name="Mantenimiento">
					<Checkbox bind:checked={formData.maintance} />
				</Label>
			</div>
		</DialogBody>
		<DialogFooter submitFunc={handleSubmit} hideFunc={() => (show = false)} />
	</DialogContent>
</Dialog>
