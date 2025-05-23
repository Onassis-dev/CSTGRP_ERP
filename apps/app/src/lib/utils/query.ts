import { QueryClient, type QueryKey } from '@tanstack/svelte-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchInterval: 60000
		}
	}
});

const bc = new BroadcastChannel('cst-query');

export function setupQuerySync(queryClient: QueryClient) {
	bc.onmessage = (event) => {
		const { type, queryKey } = event.data;
		if (type === 'query-refetch') queryClient.refetchQueries({ queryKey });
	};
}

export const refetch = (queryKey: QueryKey) => {
	queryClient.refetchQueries({ queryKey });
	bc.postMessage({ type: 'query-refetch', queryKey });
};
