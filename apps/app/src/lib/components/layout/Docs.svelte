<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { HelpCircle } from 'lucide-svelte';
	import { Button } from '../ui/button';
	import api from '$lib/utils/server';
	import { location } from '$lib/utils/store';
	import { marked } from 'marked';

	let docsContent: string | null = $state(null);
	let open = $state(false);

	$effect(() => {
		if (!open) {
			docsContent = null;
			return;
		}
		api
			.get('/resources/docs/one', { params: { page: $location } })
			.then(async ({ data }) => (docsContent = await marked.parse(data)))
			.catch(() => (docsContent = null));
	});

	$inspect(docsContent);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class="ml-auto">
		<Button variant="ghost" size="icon">
			<HelpCircle class="size-3.5" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="h-[92dvh] max-h-[92dvh] w-[92dvw] max-w-[92dvw] overflow-scroll">
		<div id="docs-content" class="mx-auto h-full w-full max-w-4xl p-4 py-12">
			{@html docsContent}
		</div>
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(#docs-content) {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		line-height: 1.6;
		color: #374151;
		overflow-wrap: break-word;
	}

	:global(#docs-content h1) {
		font-size: 2.25rem;
		font-weight: 700;
		margin: 2rem 0 1rem 0;
		color: #111827;
		border-bottom: 2px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	:global(#docs-content h2) {
		font-size: 1.875rem;
		font-weight: 600;
		margin: 1.75rem 0 0.75rem 0;
		color: #111827;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 0.25rem;
	}

	:global(#docs-content h3) {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 1.5rem 0 0.5rem 0;
		color: #111827;
	}

	:global(#docs-content h4) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 1.25rem 0 0.5rem 0;
		color: #111827;
	}

	:global(#docs-content h5) {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem 0;
		color: #111827;
	}

	:global(#docs-content h6) {
		font-size: 1rem;
		font-weight: 600;
		margin: 1rem 0 0.5rem 0;
		color: #6b7280;
	}

	:global(#docs-content p) {
		margin: 1rem 0;
		line-height: 1.7;
	}

	:global(#docs-content ul),
	:global(#docs-content ol) {
		margin: 1rem 0;
		padding-left: 1.5rem;
	}

	:global(#docs-content li) {
		margin: 0.5rem 0;
		line-height: 1.6;
	}

	:global(#docs-content ul li) {
		list-style-type: disc;
	}

	:global(#docs-content ol li) {
		list-style-type: decimal;
	}

	:global(#docs-content blockquote) {
		margin: 1.5rem 0;
		padding: 1rem 1.5rem;
		border-left: 4px solid #3b82f6;
		background-color: #f8fafc;
		border-radius: 0.375rem;
		font-style: italic;
		color: #4b5563;
	}

	:global(#docs-content blockquote p) {
		margin: 0;
	}

	:global(#docs-content code) {
		background-color: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-size: 0.875em;
		color: #dc2626;
	}

	:global(#docs-content pre) {
		background-color: #1f2937;
		color: #f9fafb;
		padding: 1.5rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1.5rem 0;
		font-family:
			'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	:global(#docs-content pre code) {
		background-color: transparent;
		padding: 0;
		color: inherit;
		font-size: inherit;
	}

	:global(#docs-content a) {
		color: #3b82f6;
		text-decoration: none;
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s ease;
	}

	:global(#docs-content a:hover) {
		border-bottom-color: #3b82f6;
	}

	:global(#docs-content strong) {
		font-weight: 600;
		color: #111827;
	}

	:global(#docs-content em) {
		font-style: italic;
	}

	:global(#docs-content hr) {
		border: none;
		border-top: 1px solid #e5e7eb;
		margin: 2rem 0;
	}

	:global(#docs-content table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1.5rem 0;
		font-size: 0.875rem;
	}

	:global(#docs-content th),
	:global(#docs-content td) {
		border: 1px solid #e5e7eb;
		padding: 0.75rem;
		text-align: left;
	}

	:global(#docs-content th) {
		background-color: #f9fafb;
		font-weight: 600;
		color: #111827;
	}

	:global(#docs-content tr:nth-child(even)) {
		background-color: #f9fafb;
	}

	:global(#docs-content img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1rem 0;
	}

	:global(#docs-content .highlight) {
		background-color: #fef3c7;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		:global(#docs-content h1) {
			font-size: 1.875rem;
		}

		:global(#docs-content h2) {
			font-size: 1.5rem;
		}

		:global(#docs-content h3) {
			font-size: 1.25rem;
		}

		:global(#docs-content pre) {
			padding: 1rem;
			font-size: 0.75rem;
		}
	}
</style>
