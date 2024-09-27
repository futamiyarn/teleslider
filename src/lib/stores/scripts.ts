// src/lib/stores/scripts.js
import { writable } from 'svelte/store';

export const originalScripts = writable<string>('');
export const scriptStores = writable<string[]>([]);
