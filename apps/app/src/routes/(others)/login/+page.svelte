<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
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

<section class="flex min-h-screen w-full flex-col items-center justify-center">
	<Card class="mx-auto w-[95%] max-w-md">
		<CardHeader>
			<CardTitle>Ingresar</CardTitle>
		</CardHeader>
		<CardContent>
			<form onsubmit={login}>
				<div class="mb-6 grid gap-6">
					<div class="mb-6">
						<p class="mb-2">Nombre de usuario</p>
						<Input
							bind:value={credentials.username}
							type="text"
							id="username"
							placeholder="usuario"
						/>
					</div>
					<div class="mb-6">
						<p class="mb-2">Contraseña</p>
						<Input
							bind:value={credentials.password}
							type="password"
							id="password"
							placeholder="•••••••••"
						/>
					</div>

					<Button type="submit">Acceder</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</section>
