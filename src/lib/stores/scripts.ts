// src/lib/stores/scripts.js
import { writable } from 'svelte/store';

export const htmlScripts = writable<string>('');
export const textScripts = writable<string>('');
export const scriptStores = writable<string[]>([]);
export const scriptLoaded = writable<Record<string, number>>({});
export const currentId = writable<string>('');

export const wordCount = writable<number>(0);
export const sentenceCount = writable<number>(0);
export const charCount = writable<number>(0);
