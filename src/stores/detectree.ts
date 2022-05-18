import { writable } from 'svelte/store';

export const searchVisibility = writable(true);
export const showSingleNodes = writable(true);
export const showNetworkNodes = writable(true);
export const showFileNodes = writable(true);
export const showRegistryNodes = writable(true);
