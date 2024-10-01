<script lang="ts">
	import '$lib/styles/global.scss';
	import { onMount } from 'svelte';

	async function detectSWUpdate() {
		const registration = await navigator.serviceWorker.ready;

		registration.addEventListener('updatefound', () => {
			const newSW = registration.installing;

			newSW?.addEventListener('statechange', () => {
				if (newSW.state === 'installed') {
					if (confirm('New version available. Load new version?')) {
						newSW.postMessage({ type: 'SKIP_WAITING' });
						window.location.reload();
					}
				}
			});
		});
	}

	onMount(() => {
		// detectSWUpdate();

		fetch('/read')
			.then((res) => res.text())
			.then((text) => {
				console.log('Read page is cached');
			});
	});
</script>

<slot />
