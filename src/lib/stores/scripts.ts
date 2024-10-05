// src/lib/stores/scripts.js
import { writable } from 'svelte/store';

export const textScripts = writable<string>('');
export const htmlScripts = writable<string>('');
export const scriptStores = writable<string[]>([]);
export const scriptLoaded = writable<Record<string, number>>({});
