<script lang="ts">
	import { run } from 'svelte/legacy';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuTrigger,
		DropdownMenuItem
	} from '$lib/components/ui/dropdown-menu';
	import Cookies from 'js-cookie';
	import { sidebarOpen } from '../../utils/store';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Card } from '$lib/components/ui/card';
	import Package from 'lucide-svelte/icons/package';
	import {
		GitMerge,
		LogOut,
		Monitor,
		Shield,
		UserCircle,
		Users,
		ShoppingBag,
		Folders,
		ShoppingCart,
		AlertTriangle,
		Factory
	} from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
	import { browser } from '$app/environment';
	import { hasAccess } from '$lib/utils/functions';

	const username = Cookies.get('username');

	function closeSidebar() {
		sidebarOpen.set(false);
	}

	run(() => {
		if ($sidebarOpen) {
			requestAnimationFrame(() => {
				document.querySelector('main')?.addEventListener('click', closeSidebar);
			});
		} else {
			if (browser) document.querySelector('main')?.removeEventListener('click', closeSidebar);
		}
	});
</script>

<Card
	class={cn(
		'md: fixed -left-64 bottom-0 top-0 z-40 flex w-60 flex-col rounded-none bg-[#fbfbfb] shadow-none transition-all duration-300 xl:left-0',
		$sidebarOpen ? 'left-0' : ''
	)}
>
	<a href="/" class="flex h-[49px] w-full items-center gap-3 border-b px-4 pt-0 font-semibold">
		{#if import.meta.env.VITE_TESTING === 'true'}
			<AlertTriangle class="size-6 text-yellow-500" />
			TEST
		{:else}
			<img src="/logo.png" alt="logo" class="h-6 w-6" />
			CST Group
		{/if}
	</a>

	<Accordion.Root class="px-2 pt-2" type="single">
		{#if hasAccess('prod_corte') || hasAccess('prod_cortesVarios') || hasAccess('prod_produccion') || hasAccess('prod_calidad') || hasAccess('prod_serigrafia')}
			<Accordion.Item value="production" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted  mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<Factory class="size-3.5 text-[#5c5e63]" />
					Producción
				</Accordion.Trigger>
				<Accordion.Content>
					{#if hasAccess('prod_corte')}
						<Accordion.Option href="/production/corte" />
					{/if}
					{#if hasAccess('prod_cortesVarios')}
						<Accordion.Option href="/production/cortes-varios" />
					{/if}
					{#if hasAccess('prod_produccion')}
						<Accordion.Option href="/production/produccion" />
					{/if}
					{#if hasAccess('prod_calidad')}
						<Accordion.Option href="/production/calidad" />
					{/if}
					{#if hasAccess('prod_serigrafia')}
						<Accordion.Option href="/production/serigrafia" />
					{/if}
					{#if hasAccess('prodmovements')}
						<Accordion.Option href="/production/history" />
					{/if}
				</Accordion.Content>
			</Accordion.Item>
		{/if}

		{#if hasAccess('inventory') || hasAccess('materialmovements') || hasAccess('requisitions') || hasAccess('poimp')}
			<Accordion.Item value="warehouse" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted  mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<Package class="size-3.5 text-[#5c5e63]" />
					Almacen
				</Accordion.Trigger>
				<Accordion.Content>
					{#if hasAccess('inventorystats')}
						<Accordion.Option href="/warehouse/dashboard" />
					{/if}
					{#if hasAccess('inventory')}
						<Accordion.Option href="/warehouse/inventory" />
					{/if}
					{#if hasAccess('materialmovements')}
						<Accordion.Option href="/warehouse/movements" />
					{/if}
					{#if hasAccess('poimp')}
						<Accordion.Option href="/warehouse/po-imp" />
					{/if}
					{#if hasAccess('requisitions')}
						<Accordion.Option href="/warehouse/requisitions" />
					{/if}
					{#if hasAccess('petitions')}
						<Accordion.Option href="/warehouse/petitions" />
					{/if}
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if hasAccess('purchases')}
			<Accordion.Item value="purchases" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted  mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<ShoppingCart class="size-3.5 text-[#5c5e63]" />
					Compras
				</Accordion.Trigger>
				<Accordion.Content>
					<Accordion.Option href="/purchases/categories" />
					<Accordion.Option href="/purchases/products" />
					<Accordion.Option href="/purchases/suppliers" />
					<Accordion.Option href="/purchases/orders" />
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if hasAccess('employees') || hasAccess('assistance') || hasAccess('productivity')}
			<Accordion.Item value="hr" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<Users class="size-3.5 text-[#5c5e63]" />
					RRHH
				</Accordion.Trigger>
				<Accordion.Content>
					{#if hasAccess('employees')}
						<Accordion.Option href="/hr/dashboard" />
					{/if}
					{#if hasAccess('employees')}
						<Accordion.Option href="/hr/employees" />
					{/if}
					{#if hasAccess('assistance')}
						<Accordion.Option href="/hr/assistance" />
					{/if}
					{#if hasAccess('productivity')}
						<Accordion.Option href="/hr/productivity" />
					{/if}
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if hasAccess('it')}
			<Accordion.Item value="it" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<Monitor class="size-3.5 text-[#5c5e63]" />
					Sistemas
				</Accordion.Trigger>

				<Accordion.Content>
					<Accordion.Option href="/it/devices" />
					<Accordion.Option href="/it/emails" />
					<Accordion.Option href="/it/computers" />
					<Accordion.Option href="/it/docs" />
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if hasAccess('structure')}
			<Accordion.Item value="structure" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<GitMerge class="size-3.5 text-[#5c5e63]" />
					Estructura
				</Accordion.Trigger>

				<Accordion.Content>
					<Accordion.Option href="/structure/areas" />
					<Accordion.Option href="/structure/positions" />
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if !hasAccess('inventory') && !hasAccess('users') && !hasAccess('structure') && !hasAccess('it') && !hasAccess('assistance') && !hasAccess('productivity') && !hasAccess('employees') && !hasAccess('materialmovements') && !hasAccess('poimp') && !hasAccess('formats') && !hasAccess('directory') && !hasAccess('purchases')}
			<Accordion.Item value="clients" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<ShoppingBag class="size-3.5 text-[#5c5e63]" />
					Clients
				</Accordion.Trigger>

				<Accordion.Content>
					<Accordion.Option href="/clients/inventory" />
					<Accordion.Option href="/clients/jobs" />
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if hasAccess('users')}
			<Accordion.Item value="admin" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<Shield class="size-3.5 text-[#5c5e63]" />
					Admin
				</Accordion.Trigger>

				<Accordion.Content>
					<Accordion.Option href="/admin/users" />
					<Accordion.Option href="/admin/records" />
				</Accordion.Content>
			</Accordion.Item>
		{/if}
		{#if hasAccess('formats') || hasAccess('directory')}
			<Accordion.Item value="resources" class="border-none">
				<Accordion.Trigger
					class="hover:bg-muted mb-[1px] h-8 rounded-md p-2 text-sm hover:no-underline"
				>
					<Folders class="size-3.5 text-[#5c5e63]" />
					Recursos
				</Accordion.Trigger>

				<Accordion.Content>
					{#if hasAccess('directory')}
						<Accordion.Option href="/resources/directory" />
					{/if}
					{#if hasAccess('formats')}
						<Accordion.Option href="/resources/formats" />
					{/if}
					{#if hasAccess('docs') && parseInt(Cookies.get('perm_docs') || '0') > 1}
						<Accordion.Option href="/resources/docs" />
					{/if}
				</Accordion.Content>
			</Accordion.Item>
		{/if}
	</Accordion.Root>

	<div class="mt-auto space-y-1 px-2 pb-2">
		<p class="hover:bg-muted flex h-8 items-center gap-2 rounded-md px-2 text-sm">
			<UserCircle class="size-3.5 text-[#5c5e63]" />
			{username}
		</p>

		<DropdownMenu>
			<DropdownMenuTrigger
				class="hover:bg-muted flex h-8 w-full items-center gap-2 rounded-md p-2 text-sm"
			>
				<LogOut class="size-3.5 text-[#5c5e63]" />
				Salir
			</DropdownMenuTrigger>
			<DropdownMenuContent side="bottom" align="start">
				<DropdownMenuItem onclick={() => goto('/login')} class="text-red-500">
					Cerrar sesión
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	</div>
</Card>
