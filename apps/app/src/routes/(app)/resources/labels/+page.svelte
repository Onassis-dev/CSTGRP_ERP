<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import Button from '$lib/components/ui/button/button.svelte';
	let jobs: any = $state([]);

	const labelList = [
		'inspector',
		'bastones',
		'bastones-back',
		'bastones-front',
		'codigo-yamaha',
		'warning',
		'cantidad',
		'info',
		'outer-armor',
		'commercial',
		'kawasaki',
		'yamaha',
		'yamaha-info',
		'yamaha-info-2'
	];

	let selectedLabels: string[] = $derived.by(() => {
		return labelList;
	});
</script>

<div>
	<Input
		type="file"
		accept=".pdf"
		onchange={async (e) => {
			const file = (e.target as HTMLInputElement)?.files?.[0];
			const form = new FormData();
			if (file) {
				form.append('file', file);
				const result = (await api.post('/resources/labels/get-job', form)).data;
				console.log(result);
				jobs = [...jobs, result];
			}
		}}
	/>
</div>

<div class="flex w-full max-w-sm flex-col gap-6">
	<Tabs.Root value="account">
		<Tabs.List>
			{#each jobs as job}
				<Tabs.Trigger value={job.jobpo}>{job.jobpo}</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#each jobs as job}
			<Tabs.Content value={job.jobpo}
				>{job.jobpo}

				<div>
					<Input bind:value={job.jobpo} />
					<Input bind:value={job.part} />
					<Input bind:value={job.description} />
					<Input bind:value={job.amount} />
					<Input bind:value={job.perBox} />
					<Input bind:value={job.po} />
					<Input bind:value={job.so} />
				</div>

				<div>
					{#each selectedLabels as label}
						<Button
							onclick={async () => {
								const result = await api.post(
									'/resources/labels/print',
									{
										type: label,
										info: {
											code: job.part,
											description: job.description,
											amount: job.amount,
											jobpo: job.jobpo,
											date: job.due,
											so: job.so,
											po: job.po
										}
									},
									{ responseType: 'arraybuffer' }
								);
								window.open(
									URL.createObjectURL(new Blob([result.data], { type: 'image/jpeg' })),
									'_blank'
								);
								URL.revokeObjectURL(URL.createObjectURL(new Blob([result.data])));
							}}>{label}</Button
						>
					{/each}
				</div>
			</Tabs.Content>
		{/each}
	</Tabs.Root>
</div>
