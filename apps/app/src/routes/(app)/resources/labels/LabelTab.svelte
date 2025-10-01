<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import api from '$lib/utils/server';

	interface Props {
		job: any;
	}

	let { job = $bindable() }: Props = $props();

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
	};

	let selectedLabels: LabelButton[] = $derived.by(() => {
		if (!job) return [];
		const part = job.part;
		const bastones: number = 0;

		let usedLabels: (keyof typeof labelList)[] = [];

		if (part[0] === 'F') {
			if (bastones === 2) {
				usedLabels = [
					'inspector',
					'bastones-front',
					'bastones-back',
					'codigo-yamaha',
					'warning',
					'cantidad',
					'info',
					'yamaha'
				];
			} else if (bastones === 1) {
				usedLabels = [
					'inspector',
					'bastones',
					'codigo-yamaha',
					'warning',
					'cantidad',
					'info',
					'yamaha'
				];
			} else {
				usedLabels = ['inspector', 'codigo-yamaha', 'warning', 'cantidad', 'info', 'yamaha'];
			}
		} else if (part[0] === 'P') {
			usedLabels = ['cantidad', 'yamaha'];
		} else if (part[0] === '4') {
			usedLabels = [
				'inspector',
				'bastones',
				'codigo-polaris',
				'warning',
				'cantidad',
				'info',
				'outer-armor'
			];
		} else if (part.slice(0, 3) === 'MWV') {
			usedLabels = ['codigo-yamaha', 'cantidad', 'yamaha'];
		} else if (part.slice(0, 3) === 'MAR') {
			usedLabels = ['codigo-yamaha', 'cantidad', 'yamaha-info', 'yamaha-info-2'];
		} else if (part.slice(0, 2) === '18') {
			usedLabels = ['codigo-chaparral', 'cantidad', 'yamaha'];
		} else if (part.slice(0, 4) === 'DJBC') {
			usedLabels = ['cantidad', 'info', 'outer-armor'];
		} else if (part.slice(0, 2) === 'MB') {
			usedLabels = ['cantidad', 'info', 'outer-armor'];
		} else if (part.slice(0, 3) === 'SAN') {
			usedLabels = ['cantidad', 'info', 'outer-armor'];
		} else if (part.slice(0, 2) === 'ST') {
			usedLabels = ['cantidad', 'outer-armor'];
		} else if (part.slice(0, 2) === '28') {
			usedLabels = ['codigo-polaris', 'commercial'];
		} else if (part[0] === 'W' || part[0] === '9') {
			usedLabels = ['codigo-kawasaki', 'cantidad', 'kawasaki'];
		}

		const buttons: LabelButton[] = [];

		usedLabels.forEach((label) => {
			if (label === 'cantidad') {
				job.destinations.forEach((destination: any) => {
					const atLeast = Number(destination.amount) / job.perBox;
					if (atLeast >= 1) {
						buttons.push({
							name: label,
							amount: Math.floor(Number(destination.amount) / job.perBox),
							po: destination.po,
							so: destination.so,
							labelAmount: Number(job.perBox)
						});
					}
					const rest = Number(destination.amount) % job.perBox;
					if (rest) {
						buttons.push({
							name: label,
							amount: 1,
							po: destination.po,
							so: destination.so,
							labelAmount: rest
						});
					}
				});
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

<Tabs.Content value={job.jobpo}>
	<div>
		<Input bind:value={job.jobpo} />
		<Input bind:value={job.part} />
		<Input bind:value={job.description} />
		<Input bind:value={job.amount} />
		<Input bind:value={job.perBox} />
		{#each job.destinations as destination}
			<p>Hola</p>
			<Input bind:value={destination.po} />
			<Input bind:value={destination.so} />
			<Input bind:value={destination.amount} />
		{/each}
	</div>

	<div>
		{#each selectedLabels as label}
			<Button
				onclick={async () => {
					console.log(job);
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
					window.open(
						URL.createObjectURL(new Blob([result.data], { type: 'image/jpeg' })),
						'_blank'
					);
					URL.revokeObjectURL(URL.createObjectURL(new Blob([result.data])));
				}}>{label.name}, {label.amount}</Button
			>
		{/each}
	</div>
</Tabs.Content>
