<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import SideBar from '$lib/components/layout/SideBar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { showError } from '$lib/utils/showToast';
	import { onDestroy, onMount } from 'svelte';
	import '../../app.css';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Cookies from 'js-cookie';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	function handleUnhandledRejection(e: PromiseRejectionEvent) {
		if (e.reason.name === 'AxiosError') showError(e.reason);
	}

	onMount(() => {
		if (!Cookies.get('username')) goto('/login');
		window.addEventListener('unhandledrejection', handleUnhandledRejection);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('unhandledrejection', handleUnhandledRejection);
	});
</script>

<div class="app flex">
	<SideBar></SideBar>
	<main class="flex h-[100lvh] w-full flex-col bg-white xl:ml-60 xl:w-[calc(100%-240px)]">
		<Header></Header>
		{@render children?.()}
	</main>
</div>

<Toaster />
