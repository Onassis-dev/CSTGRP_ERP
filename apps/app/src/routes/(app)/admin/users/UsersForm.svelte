<script lang="ts">
	import Label from '$lib/components/basic/Label.svelte';
	import Select from '$lib/components/basic/Select.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import {
		Dialog,
		DialogBody,
		DialogContent,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent
	} from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Label as LabelBase } from '$lib/components/ui/label';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { ChevronDown } from 'lucide-svelte';
	import { refetch } from '$lib/utils/query';
	import { getOptions } from '$lib/utils/queries';
	import { createQuery } from '@tanstack/svelte-query';

	interface Props {
		show?: boolean;
		selectedUser: any;
	}

	let { show = $bindable(false), selectedUser = $bindable({}) }: Props = $props();
	let formData: any = $state();

	function setFormData() {
		selectedAreas = selectedUser?.perm_assistance_areas?.split(',') || [];
		formData = { ...selectedUser };
	}

	const permissions = [
		{ value: 0, name: 'Ninguno', color: 'gray' },
		{ value: 1, name: 'Leer', color: 'green' },
		{ value: 2, name: 'Modificar', color: 'blue' }
	];
	let selectedAreas: any[] = $state([]);

	const areasQuery = createQuery({
		queryKey: ['areas'],
		queryFn: async () => (await api.get('/hrvarious/areas')).data
	});
	let areas = $derived(getOptions($areasQuery.data));

	async function handleSubmit() {
		Object.keys(formData).forEach((key) => {
			if (key.startsWith('perm_')) {
				formData[key] = parseInt(formData[key]);
			}
		});

		if (selectedUser.id) {
			if (formData.password === '') delete formData.password;
			await api.put('users', {
				...formData,
				id: parseInt(formData.id || ''),
				perm_assistance_areas: selectedAreas[0] === 'Todas' ? 'Todas' : selectedAreas.join(',')
			});
			showSuccess('Usuario actualizado');
		} else {
			await api.post('users', {
				...formData,
				id: parseInt(formData.id || ''),
				perm_assistance_areas: selectedAreas[0] === 'Todas' ? 'Todas' : selectedAreas.join(',')
			});
			showSuccess('Usuario registrado');
		}
		refetch(['users']);
		show = false;
	}

	function handleCheck(v: any, i: number) {
		if (v) {
			selectedAreas.push(areas[i].value);
		} else {
			selectedAreas = selectedAreas.filter((area) => {
				return area !== areas[i].value;
			});
		}
	}
	function checkAll(v: any) {
		if (v) {
			selectedAreas = ['Todas'];
		} else {
			selectedAreas = [];
		}
	}

	$effect(() => {
		show;
		setFormData();
	});
</script>

<Dialog bind:open={show}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle
				>{selectedUser.id
					? `Editar información de ${selectedUser.username}`
					: 'Registrar usuario'}</DialogTitle
			>
		</DialogHeader>

		<DialogBody class="max-w-2xl">
			<div class="grid w-full gap-4">
				<div class="grid grid-cols-2 gap-4">
					<Label name="Nombre">
						<Input name="text" bind:value={formData.username} />
					</Label>
					<Label name="Contraseña">
						<Input name="text" bind:value={formData.password} />
					</Label>
				</div>

				<div class="grid grid-cols-3 gap-4 rounded-md border p-2">
					<h3 class="col-span-3 w-full pl-0.5 font-semibold">General</h3>
					<Label name="Perm. Usuarios">
						<Select items={permissions} bind:value={formData.perm_users} />
					</Label>
					<Label name="Perm. Estructura">
						<Select items={permissions} bind:value={formData.perm_structure} />
					</Label>
					<Label name="Perm. Formatos">
						<Select items={permissions} bind:value={formData.perm_formats} />
					</Label>
					<Label name="Perm. Directorio">
						<Select items={permissions} bind:value={formData.perm_directory} />
					</Label>
					<Label name="Perm. Documentos">
						<Select items={permissions} bind:value={formData.perm_docs} />
					</Label>
				</div>

				<div class="grid grid-cols-3 gap-4 rounded-md border p-2">
					<h3 class="col-span-3 w-full pl-0.5 font-semibold">RRHH</h3>
					<Label name="Perm. Empleados">
						<Select items={permissions} bind:value={formData.perm_employees} />
					</Label>
					<Label name="Perm. Asistencia">
						<Select items={permissions} bind:value={formData.perm_assistance} />
					</Label>
					<Label name="Perm. Productividad">
						<Select items={permissions} bind:value={formData.perm_productivity} />
					</Label>
				</div>

				<div class="grid grid-cols-3 gap-4 rounded-md border p-2">
					<h3 class="col-span-3 w-full pl-0.5 font-semibold">Almacen</h3>
					<Label name="Perm. Inventario">
						<Select items={permissions} bind:value={formData.perm_inventory} />
					</Label>
					<Label name="Perm. Movimientos">
						<Select items={permissions} bind:value={formData.perm_materialmovements} />
					</Label>
					<Label name="Perm. Dashboard">
						<Select items={permissions} bind:value={formData.perm_inventorystats} />
					</Label>
					<Label name="Perm. Requisiciones">
						<Select items={permissions} bind:value={formData.perm_requisitions} />
					</Label>
					<Label name="Perm. Peticiones">
						<Select items={permissions} bind:value={formData.perm_petitions} />
					</Label>
					<Label name="Perm. Po-Imp">
						<Select items={permissions} bind:value={formData.perm_poimp} />
					</Label>
				</div>

				<div class="grid grid-cols-3 gap-4 rounded-md border p-2">
					<h3 class="col-span-3 w-full pl-0.5 font-semibold">Sistemas</h3>
					<Label name="Perm. Sistemas">
						<Select items={permissions} bind:value={formData.perm_it} />
					</Label>
				</div>

				<div class="grid grid-cols-3 gap-4 rounded-md border p-2">
					<h3 class="col-span-3 w-full pl-0.5 font-semibold">Compras</h3>
					<Label name="Perm. Compras">
						<Select items={permissions} bind:value={formData.perm_purchases} />
					</Label>
				</div>

				<div class="grid grid-cols-2 gap-4 rounded-md border p-2">
					<h3 class="col-span-2 w-full pl-0.5 font-semibold">Extras</h3>
					<Label name="Areas">
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Button variant="outline" class="w-full"
									>Seleccionar<ChevronDown class="text-primary ms-2 size-3.5" /></Button
								>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{#each areas as area, i}
									<li class="list-none">
										<Checkbox
											id={'c-' + area.name}
											checked={selectedAreas.includes(area.value) || selectedAreas[0] === 'Todas'}
											onCheckedChange={(v) => {
												handleCheck(v, i);
											}}
										/>
										<LabelBase for={'c-' + area.name}>{area.name}</LabelBase>
									</li>
								{/each}
								<li class="list-none">
									<Checkbox
										id="c-todas"
										checked={selectedAreas[0] === 'Todas'}
										onCheckedChange={(v) => {
											console.log(v);
											checkAll(v);
										}}
									/>
									<LabelBase for="c-todas" class="font-semibold">Todas</LabelBase>
								</li>
							</DropdownMenuContent>
						</DropdownMenu>
					</Label>
					<Label name="Mantenimiento">
						<Checkbox bind:checked={formData.maintance} />
					</Label>
				</div>
			</div>

			<Button type="submit" class="mt-4 w-full" onclick={handleSubmit}>Guardar cambios</Button>
		</DialogBody>
	</DialogContent>
</Dialog>
