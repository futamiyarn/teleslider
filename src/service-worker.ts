/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE_NAME = `c-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	async function addFileCache() {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFileCache());
});

self.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE_NAME) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	async function handleRequest() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE_NAME);

		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(event.request);
			if (cachedResponse) return cachedResponse;
		}

		try {
			const response = await fetch(event.request);
			const notExt = url.protocol === 'http:' || url.protocol === 'https:';
			const isSuccess = response.status === 200;

			if (notExt && isSuccess) {
				cache.put(event.request, response.clone());
			}

			return response;
		} catch (error) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) return cachedResponse;
		}

		return new Response('Not Found', { status: 404 });
	}

	event.respondWith(handleRequest());
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
