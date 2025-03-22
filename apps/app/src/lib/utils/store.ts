import { writable } from 'svelte/store';

export const location = writable('');

export const sidebarOpen = writable(false);

export const conversorOpen = writable(false);
