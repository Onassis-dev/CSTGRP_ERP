<script lang="ts">
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import Header from '$lib/components/layout/Header.svelte';
	import SideBar from '$lib/components/layout/SideBar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { showError } from '$lib/utils/showToast';
	import { onDestroy, onMount } from 'svelte';
	import '../../app.css';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import api from '$lib/utils/server';
	import { queryClient, setupQuerySync } from '$lib/utils/query';
	import Command from '$lib/components/layout/tools/Command.svelte';
	import { userData } from '$lib/utils/store';
	import { Loader2 } from 'lucide-svelte';
	import Cookies from 'js-cookie';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	function handleUnhandledRejection(e: PromiseRejectionEvent) {
		if (e.reason.name === 'AxiosError') showError(e.reason);
	}

	onMount(() => {
		api
			.get('/auth/user')
			.then((res) => {
				userData.set(res.data);
				if (!$userData) goto('/login');
				Object.keys(Cookies.get()).forEach(function (cookieName) {
					Cookies.remove(cookieName);
				});
			})
			.catch(() => {
				goto('/login');
			});

		window.addEventListener('unhandledrejection', handleUnhandledRejection);

		setupQuerySync(queryClient);
	});

	onDestroy(() => {
		if (browser) window.removeEventListener('unhandledrejection', handleUnhandledRejection);
	});

	let open = $state(false);
</script>

{#if $userData}
	<QueryClientProvider client={queryClient}>
		<div class="app flex">
			<SideBar></SideBar>
			<main class="flex h-[100lvh] w-full flex-col bg-white xl:ml-60 xl:w-[calc(100%-240px)]">
				<Header bind:open />
				{@render children?.()}
			</main>
		</div>
	</QueryClientProvider>

	<Command bind:open />
	<Toaster />
{:else}
	<div class="flex h-screen w-screen items-center justify-center">
		<Loader2 class="size-14 animate-spin" strokeWidth={1} />
	</div>
{/if}
