<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { formatDate, getImage } from '$lib/utils/functions';
	import Input from '$lib/components/ui/input/input.svelte';
	import { cn } from '$lib/utils';
	import api from '$lib/utils/server';
	import { showError } from '$lib/utils/showToast';
	import { Delete, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const alphanumericKeys = [
		['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
		['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
		['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
		['clear', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'backspace']
	];

	let isLoading = true;

	let numberEmployee = $state('');
	let rfc = $state('');
	let employee: Record<string, string> | null = $state(null);

	let activeInput: 'no' | 'rfc' | '' = $state('');

	const keyPressed = (key: string) => {
		if (activeInput === 'no') {
			if (/^\d{1,5}$/.test(numberEmployee + key)) numberEmployee += key;
		}
		if (activeInput === 'rfc') {
			if (/^[0-9A-Z]{1,3}$/.test(rfc + key)) rfc += key;
		}
	};

	const actionKey = (key: string) => {
		if (key === 'backspace') {
			if (activeInput === 'no') numberEmployee = numberEmployee.slice(0, -1);
			if (activeInput === 'rfc') rfc = rfc.slice(0, -1);
			return;
		}
		if (key === 'clear') {
			if (activeInput === 'no') numberEmployee = '';
			if (activeInput === 'rfc') rfc = '';
		}
	};

	const handleConsult = async () => {
		if (!numberEmployee || !rfc) return showError(null, 'Faltan datos');

		isLoading = true;
		const result = await api.get('/kiosk', {
			params: {
				noEmpleado: numberEmployee,
				rfc: rfc
			}
		});

		employee = result.data;

		activeInput = '';
		numberEmployee = '';
		rfc = '';
	};

	onMount(() => {});
</script>

<div class="grid h-screen w-full grid-cols-[45rem_1fr]">
	<div class="flex h-full flex-col border-r p-8">
		<div class="flex flex-col items-center gap-8">
			<img src="/bcpet.svg" alt="logo" class="w-24 object-cover" />
			<p class="text-2xl font-semibold">Consulta de datos</p>

			<div class="flex w-full flex-col gap-2">
				<p class="text-sm font-medium">Número de empleado</p>
				<Input
					bind:value={numberEmployee}
					onfocus={() => (activeInput = 'no')}
					class={cn(
						'h-11 w-full rounded-md border border-gray-300 p-2 text-lg focus-visible:ring-0',
						activeInput === 'no' && 'border-primary'
					)}
				/>
				<p class="mt-2 text-sm font-medium">Homoclave</p>
				<Input
					bind:value={rfc}
					onfocus={() => (activeInput = 'rfc')}
					class={cn(
						'h-11 w-full rounded-md border border-gray-300 p-2 text-lg focus-visible:ring-0',
						activeInput === 'rfc' && 'border-primary'
					)}
				/>
			</div>

			<div class="flex w-full flex-col gap-2">
				{#each alphanumericKeys as row}
					<div class="flex w-full justify-center gap-2">
						{#each row as key}
							{#if key === 'clear' || key === 'backspace'}
								<button
									onclick={() => actionKey(key)}
									class="flex h-16 w-20 flex-grow-0 items-center justify-center rounded-md border border-gray-300 bg-gray-100 p-2 font-semibold"
								>
									{#if key === 'clear'}
										<X class="size-5" />
									{:else if key === 'backspace'}
										<Delete class="size-5" />
									{:else}
										{key}
									{/if}
								</button>{:else}
								<button
									onclick={() => keyPressed(key)}
									class="flex h-16 w-14 flex-grow-0 items-center justify-center rounded-md border border-gray-300 p-2 font-semibold"
								>
									{#if key === 'clear'}
										<X class="size-5" />
									{:else if key === 'backspace'}
										<Delete class="size-5" />
									{:else}
										{key}
									{/if}
								</button>
							{/if}
						{/each}
					</div>
				{/each}
			</div>

			<Button size="lg" class="w-full" onclick={handleConsult}>Consultar</Button>

			{#if employee}
				<Button
					size="lg"
					class="mt-auto w-full"
					variant="outline"
					onclick={() => (employee = null)}
				>
					Cerrar
				</Button>
			{/if}
		</div>
	</div>
	<div class="bg-muted h-screen overflow-auto p-6">
		{#if employee}
			<Card class="p-6">
				<div class="mb-6 grid grid-cols-[auto_1fr] gap-6">
					<div class="relative aspect-square w-24 overflow-hidden rounded-lg border">
						<img
							class="h-full w-full object-cover"
							src={getImage(employee.photo) || '/person.svg'}
							alt="Foto de empleado"
						/>
					</div>
					<div>
						<p class="text-xl font-semibold">
							{employee.name}
						</p>
						<p class="text-muted-foreground text-sm">No. {employee.noEmpleado}</p>
						<div class="mt-2 flex flex-wrap gap-2">
							<div class="rounded-md border px-2 py-1 text-xs">{employee.area}</div>
							<div class="rounded-md border px-2 py-1 text-xs">{employee.position}</div>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-6">
					<div class="relative flex w-full flex-col gap-2.5 rounded-md border p-4">
						<div class="bg-background absolute -top-3 left-4 px-2 text-sm font-semibold">
							Información Personal
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Tipo de Posición:</p>
							<p class="text-sm font-medium">{employee.positionType}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Turno:</p>
							<p class="text-sm font-medium">{employee.shift}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Nacionalidad:</p>
							<p class="text-sm font-medium">{employee.nationality}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Estado Civil:</p>
							<p class="text-sm font-medium">{employee.civilStatus}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Género:</p>
							<p class="text-sm font-medium">{employee.genre}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Tipo de Sangre:</p>
							<p class="text-sm font-medium">{employee.blood}</p>
						</div>
					</div>

					<div class="relative flex w-full flex-col gap-2.5 rounded-md border p-4">
						<div class="bg-background absolute -top-3 left-4 px-2 text-sm font-semibold">
							Contacto
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Correo Electrónico:</p>
							<p class="text-sm font-medium">{employee.email}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Teléfono:</p>
							<p class="text-sm font-medium">{employee.number}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Dirección:</p>
							<p class="text-sm font-medium">{employee.direction}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Contacto de Emergencia:</p>
							<p class="text-sm font-medium">{employee.emergencyContact}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Teléfono de Emergencia:</p>
							<p class="text-sm font-medium">{employee.emergencyNumber}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Lugar de Nacimiento:</p>
							<p class="text-sm font-medium">{employee.bornLocation}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Fecha de Nacimiento:</p>
							<p class="text-sm font-medium">{formatDate(employee.bornDate)}</p>
						</div>
					</div>

					<div class="relative flex w-full flex-col gap-2.5 rounded-md border p-4">
						<div class="bg-background absolute -top-3 left-4 px-2 text-sm font-semibold">
							Información Legal
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">NSS:</p>
							<p class="text-sm font-medium">{employee.nss}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">CURP:</p>
							<p class="text-sm font-medium">{employee.curp}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">RFC:</p>
							<p class="text-sm font-medium">{employee.rfc}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Número de Clínica:</p>
							<p class="text-sm font-medium">{employee.clinicNo}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Número de Infonavit:</p>
							<p class="text-sm font-medium">{employee.infonavitNo}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Descuento de Infonavit:</p>
							<p class="text-sm font-medium">{employee.infonavitDiscount}</p>
						</div>
					</div>

					<div class="relative flex w-full flex-col gap-2.5 rounded-md border p-4">
						<div class="bg-background absolute -top-3 left-4 px-2 text-sm font-semibold">
							Información Laboral
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Fecha de Ingreso:</p>
							<p class="text-sm font-medium">{formatDate(employee.admissionDate)}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Tipo de Contrato:</p>
							<p class="text-sm font-medium">{employee.contract}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Ruta de Camión:</p>
							<p class="text-sm font-medium">{employee.route}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Fecha de BCPET:</p>
							<p class="text-sm font-medium">{formatDate(employee.bcpet)}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Banco:</p>
							<p class="text-sm font-medium">{employee.bank}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Cuenta Bancaria:</p>
							<p class="text-sm font-medium">{employee.account}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Salario de Nómina:</p>
							<p class="text-sm font-medium">{employee.nominaSalary}</p>
						</div>
						<div class="min-h-9">
							<p class="text-muted-foreground text-xs">Salario IMSS:</p>
							<p class="text-sm font-medium">{employee.immsSalary}</p>
						</div>
					</div>
				</div>
			</Card>
		{:else}
			<div class="flex h-full flex-col items-center justify-center">
				<p class="text-muted-foreground text-2xl font-semibold">Ingresa tus datos para continuar</p>
			</div>
		{/if}
	</div>
</div>
