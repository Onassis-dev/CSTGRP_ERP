<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import LabelTab from './LabelTab.svelte';
	import ScannerReader from './ScannerReader.svelte';

	let jobs: any = $state([]);
	let selectedJob = $state('');

	function handleDelete(i: number) {
		jobs = jobs.filter((job: any, index: number) => index !== i);
		selectedJob = jobs[0].jobpo;
	}
</script>

<div class="flex w-full flex-col gap-6 p-6">
	<div class="grid grid-cols-[24rem_1fr] gap-4">
		<Input
			type="file"
			accept=".pdf"
			onchange={async (e) => {
				const file = (e.target as HTMLInputElement)?.files?.[0];
				const form = new FormData();
				if (file) {
					form.append('file', file);
					const result = (await api.post('/resources/labels/get-job', form)).data;
					const existingJob = jobs.find((job: any) => job.jobpo === result.jobpo);
					if (existingJob) {
						jobs = jobs.map((job: any) => (job.jobpo === result.jobpo ? result : job));
					} else {
						jobs = [...jobs, result];
					}
					selectedJob = result.jobpo;
				}
			}}
		/>

		<ScannerReader />
	</div>

	<Tabs.Root bind:value={selectedJob}>
		<Tabs.List class="flex w-full justify-start">
			{#each jobs as job}
				<Tabs.Trigger value={job.jobpo}>{job.jobpo}</Tabs.Trigger>
			{/each}
		</Tabs.List>

		{#each jobs as _, i}
			<LabelTab bind:job={jobs[i]} handleDelete={() => handleDelete(i)} />
		{/each}
	</Tabs.Root>
</div>
