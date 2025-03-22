<script lang="ts">
	import { Table } from '../ui/table';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Table class="block h-full w-full overflow-auto" divClass="flex-1">
	{@render children?.()}
</Table>
