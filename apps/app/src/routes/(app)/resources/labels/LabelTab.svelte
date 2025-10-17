<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import api from '$lib/utils/server';
	import { cn } from '$lib/utils';
	import { openLocalFile } from '$lib/utils/functions';
	import { Trash } from 'lucide-svelte';

	interface Props {
		job: any;
		handleDelete: () => void;
	}

	let { job = $bindable(), handleDelete }: Props = $props();

	let locked = $state(true);
	let showAll = $state(false);
	let download = $state(true);

	const labelList = {
		inspector: 2,
		bastones: 2,
		'bastones-back': 2,
		'bastones-front': 2,
		'codigo-yamaha': 1,
		warning: 1,
		cantidad: 1,
		info: 0.5,
		'outer-armor': 2,
		commercial: 2,
		kawasaki: 2,
		yamaha: 2,
		'yamaha-info': 5,
		'yamaha-info-2': 5,
		'codigo-chaparral': 3,
		'codigo-polaris': 3,
		'codigo-kawasaki': 3
	};

	type LabelButton = {
		name: string;
		amount: number;
		po?: string;
		so?: string;
		labelAmount?: number;
		destinationIndex?: number;
	};

	let selectedLabels: LabelButton[] = $derived.by(() => {
		if (!job) return [];
		const part = job.part;
		const bastones: number = job.bastones.length;

		let usedLabels: (keyof typeof labelList)[] = [];

		if (showAll) {
			usedLabels = Object.keys(labelList) as (keyof typeof labelList)[];
		} else if (part[0] === 'F' && part.length === 15) {
			usedLabels = ['codigo-yamaha', 'yamaha', 'cantidad'];
		} else if (part[0] === 'F') {
			usedLabels = ['inspector', 'codigo-yamaha', 'warning', 'info', 'yamaha', 'cantidad'];
			if (bastones === 1) usedLabels.push('bastones');
			if (bastones === 2) usedLabels.push('bastones-back', 'bastones-front');
		} else if (part[0] === 'P') {
			usedLabels = ['yamaha', 'cantidad'];
		} else if (part[0] === '4') {
			usedLabels = [
				'inspector',
				'bastones',
				'codigo-polaris',
				'warning',
				'info',
				'outer-armor',
				'cantidad'
			];
		} else if (part.slice(0, 3) === 'MWV') {
			usedLabels = ['codigo-yamaha', 'yamaha', 'cantidad'];
		} else if (part.slice(0, 3) === 'MAR') {
			usedLabels = ['codigo-yamaha', 'yamaha-info', 'yamaha-info-2', 'cantidad'];
		} else if (part.slice(0, 2) === '18') {
			usedLabels = ['codigo-chaparral', 'yamaha', 'cantidad'];
		} else if (part.slice(0, 4) === 'DJBC') {
			usedLabels = ['info', 'outer-armor', 'cantidad'];
		} else if (part.slice(0, 2) === 'MB') {
			usedLabels = ['info', 'outer-armor', 'cantidad'];
		} else if (part.slice(0, 3) === 'SAN') {
			usedLabels = ['info', 'outer-armor', 'cantidad'];
		} else if (part.slice(0, 2) === 'ST') {
			usedLabels = ['outer-armor', 'cantidad'];
		} else if (part.slice(0, 2) === '28') {
			usedLabels = ['codigo-polaris', 'commercial'];
		} else if (part[0] === 'W' || part[0] === '9') {
			usedLabels = ['codigo-kawasaki', 'kawasaki', 'cantidad'];
		}

		const buttons: LabelButton[] = [];

		usedLabels.forEach((label) => {
			if (label === 'cantidad') {
				job.destinations.forEach((destination: any, i: number) => {
					const atLeast = Number(destination.amount) / job.perBox;
					if (atLeast >= 1) {
						buttons.push({
							name: label,
							amount: Math.floor(Number(destination.amount) / job.perBox),
							po: destination.po,
							so: destination.so,
							labelAmount: Number(job.perBox),
							destinationIndex: i + 1
						});
					}
					const rest = Number(destination.amount) % job.perBox;
					if (rest) {
						buttons.push({
							name: label,
							amount: 1,
							po: destination.po,
							so: destination.so,
							labelAmount: rest,
							destinationIndex: i + 1
						});
					}
				});

				if (!job.destinations.length) {
					const atLeast = Number(job.amount) / job.perBox;
					if (atLeast >= 1) {
						buttons.push({
							name: label,
							amount: Math.floor(Number(job.amount) / job.perBox),
							labelAmount: Number(job.perBox)
						});
					}
					const rest = Number(job.amount) % job.perBox;
					if (rest) {
						buttons.push({
							name: label,
							amount: 1,
							labelAmount: rest
						});
					}
				}
			} else if (label === 'codigo-chaparral' || label === 'codigo-kawasaki') {
				job.destinations.forEach((destination: any) => {
					buttons.push({
						name: label,
						amount: Math.ceil(Number(destination.amount) / labelList[label]),
						po: destination.po,
						so: destination.so
					});
				});
			} else {
				buttons.push({
					name: label,
					amount: Math.ceil(Number(job.amount) / labelList[label])
				});
			}
		});

		return buttons;
	});
</script>

<Tabs.Content value={job.jobpo} class="space-y-4">
	<div class="flex gap-1">
		<Button variant="outline" onclick={() => (locked = !locked)}>
			{locked ? 'Desbloquear' : 'Bloquear'}
		</Button>
		<Button variant="outline" onclick={() => (showAll = !showAll)}>
			{showAll ? 'Filtrar' : 'Mostrar Todo'}
		</Button>
		<Button variant="outline" onclick={() => (download = !download)}>
			{download ? 'Ver en Navegador' : 'Ver en PC'}
		</Button>
		<Button variant="outline" onclick={handleDelete}>
			<Trash class="text-red-500" />
		</Button>
	</div>
	<Card>
		<CardContent>
			<div class="grid grid-cols-6 gap-4">
				<div class="col-span-3">
					<p class="text-muted-foreground text-xs">Job:</p>
					<Input bind:value={job.jobpo} disabled={locked} />
				</div>
				<div class="col-span-3">
					<p class="text-muted-foreground text-xs">Codigo:</p>
					<Input bind:value={job.part} disabled={locked} />
				</div>
				<div class="col-span-6">
					<p class="text-muted-foreground text-xs">Descripción:</p>
					<Input bind:value={job.description} disabled={locked} />
				</div>
				<div class="col-span-2">
					<p class="text-muted-foreground text-xs">Cantidad:</p>
					<Input bind:value={job.amount} disabled={locked} />
				</div>
				<div class="col-span-2">
					<p class="text-muted-foreground text-xs">Pz/Caja:</p>
					<Input bind:value={job.perBox} disabled={locked} />
				</div>
				<div class="col-span-2">
					<p class="text-muted-foreground text-xs">Bastones:</p>
					<Input
						type="number"
						min="0"
						max="2"
						value={job.bastones.length}
						oninput={(e) => {
							const input = e.target as HTMLInputElement;
							let value = Number(input.value);
							if (value > 2) {
								input.value = '2';
								value = 2;
							}
							if (value < 0) {
								input.value = '0';
								value = 0;
							}
							job.bastones.length = value;
						}}
						disabled={locked}
					/>
				</div>
			</div>
		</CardContent>
	</Card>

	<div class="grid grid-cols-3 gap-4">
		{#each job.destinations as destination, i}
			<Card class="grid grid-cols-[auto_1fr] items-center gap-2 p-3">
				<span class="col-span-2 text-sm">Destino {i + 1}</span>
				<p class="text-muted-foreground text-xs">Po:</p>
				<Input bind:value={destination.po} disabled={locked} />
				<p class="text-muted-foreground text-xs">So:</p>
				<Input bind:value={destination.so} disabled={locked} />
				<p class="text-muted-foreground text-xs">Qty:</p>
				<Input bind:value={destination.amount} disabled={locked} />
			</Card>
		{/each}
	</div>

	<div class="flex flex-wrap gap-2">
		{#each selectedLabels as label}
			<Button
				class="grid-row-2 grid h-auto gap-0"
				onclick={async () => {
					const result = await api.post(
						'/resources/labels/print',
						{
							type: label.name,
							info: {
								code: job.part,
								description: job.description,
								jobpo: job.jobpo,
								date: job.due,
								po: label.po,
								so: label.so,
								amount: label.labelAmount
							}
						},
						{ responseType: 'arraybuffer' }
					);
					if (download) {
						if (label.name === 'codigo-yamaha') openLocalFile(result.data, 'jpeg');
						else openLocalFile(result.data, 'jpg');
					} else {
						window.open(
							URL.createObjectURL(new Blob([result.data], { type: 'image/jpeg' })),
							'_blank'
						);
						URL.revokeObjectURL(URL.createObjectURL(new Blob([result.data])));
					}
				}}
				>{label.name}
				{#if label.destinationIndex}
					({label.destinationIndex})
				{/if}
				<span class={cn('text-blue-200', label.name === 'cantidad' && 'text-red-300')}
					>{label.amount}</span
				></Button
			>
		{/each}
	</div>
</Tabs.Content>
