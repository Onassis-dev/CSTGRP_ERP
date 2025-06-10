<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner';
	import { showError } from '$lib/utils/showToast';
	import { onDestroy, onMount } from 'svelte';
	import '../../app.css';
	import { browser } from '$app/environment';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	function handleUnhandledRejection(e: PromiseRejectionEvent) {
		console.log(e);
		if (e.reason.name === 'AxiosError') showError(e.reason);
	}

	onMount(() => {
		window.addEventListener('unhandledrejection', handleUnhandledRejection);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('unhandledrejection', handleUnhandledRejection);
	});
</script>

<div class="app">
	<main>
		{@render children?.()}
	</main>
</div>

<Toaster richColors={true} />
