<script lang="ts">
	import { goto } from '$app/navigation';
	import Label from '$lib/components/basic/Label.svelte';
	import { Button } from '$lib/components/ui/button';
	import Card from '$lib/components/ui/card/card.svelte';
	import { Input } from '$lib/components/ui/input';
	import api from '$lib/utils/server';
	import { showSuccess } from '$lib/utils/showToast';
	import { onMount } from 'svelte';

	let credentials = $state({
		username: '',
		password: ''
	});

	async function logout() {
		await api.get('/auth/logout');
	}

	async function login(e: Event) {
		e.preventDefault();
		await api.post('/auth/login', credentials);
		if (credentials.username === 'kiosko') return goto('/kiosko');

		goto('/');
		showSuccess('Sesión iniciada');
	}
	onMount(() => {
		logout();
	});
</script>

<section class="flex min-h-screen w-full flex-col items-center">
	<img src="/logo.png" alt="logo" class="mb-3 mt-32 h-10" />
	<h1 class="mb-6 text-2xl font-bold">Ingresar</h1>
	<Card class="mx-2 w-96 max-w-full p-6 shadow-sm">
		<form onsubmit={login} class="flex flex-col gap-4">
			<Label name="Usuario" labelClass="text-foreground text-sm">
				<Input bind:value={credentials.username} placeholder="Usuario" class="h-9 shadow-sm" />
			</Label>
			<Label name="Contraseña" labelClass="text-foreground text-sm">
				<Input
					bind:value={credentials.password}
					type="password"
					placeholder="••••••••"
					class="h-9 shadow-sm"
					autocomplete="current-password"
				/>
			</Label>
			<Button type="submit" class="h-9">Acceder</Button>
		</form>
	</Card>
</section>
