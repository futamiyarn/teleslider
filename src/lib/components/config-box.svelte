<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount } from 'svelte';
	import getId from '$lib/stores/getId';
	import { currentId } from '$lib/stores/scripts';

	export let isConfigVisible: boolean = false;

	let WPMScale: number = 0;
	let WPSlide: number = 0;
	let WPComma: number = 0;
	let ID: string = '';
	let includeNewline: boolean = true;

	function saveLocalStorageSettings(this: Window, ev: Event) {
		if (WPMScale > 0) localStorage.setItem('WPMScale', WPMScale.toString());
		if (WPSlide > 0) localStorage.setItem('WPSlide', WPSlide.toString());
		if (WPComma > 0) localStorage.setItem('WPComma', WPComma.toString());
		localStorage.setItem('includeNewline', includeNewline ? '1' : '0');
	}

	const curID = currentId.subscribe((value) => (ID = value));

	function focusID(e: Event) {
		(e.target as HTMLInputElement).select();
	}

	onMount(() => {
		if (browser) {
			WPMScale = parseInt(localStorage.getItem('WPMScale') ?? '200');
			WPSlide = parseInt(localStorage.getItem('WPSlide') ?? '8');
			WPComma = parseInt(localStorage.getItem('WPComma') ?? '5');
			includeNewline = localStorage.getItem('includeNewline') === '1';

			window.addEventListener('change', saveLocalStorageSettings);
		}
	});

	onDestroy(() => curID);

	function copyMyID(e: ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		e.preventDefault();
		if (ID && ID !== '') {
			navigator.clipboard.writeText(`/[id:${ID}]/\n`);
		}
	}
</script>

{#if isConfigVisible}
	<div class="background">
		<section class="config" id="config">
			<span class="config-header">Config Editor</span>
			<label class="config-input">
				<span>Words per minute</span>
				<input class="w-32" min="100" max="500" step="5" bind:value={WPMScale} />
			</label>
			<span class="config-header">Reading</span>
			<label class="config-input">
				<span>Min words per slide</span>
				<input class="w-32" type="number" min="5" max="100" bind:value={WPSlide} />
			</label>
			<label class="config-input">
				<span>Min words per comma</span>
				<input class="w-32" type="number" min="5" max="100" bind:value={WPComma} />
			</label>
			<label class="config-input">
				<span>ID Transcript</span>
				<input
					type="text"
					bind:value={ID}
					placeholder="empty"
					readonly
					on:focus={focusID}
					on:copy={copyMyID}
				/>
			</label>
			<label class="config-checkbox">
				<input type="checkbox" bind:checked={includeNewline} />
				<span>Include Newline (bypass Min Words)</span>
			</label>
		</section>
	</div>
{/if}

<style lang="scss">
	.background {
		@apply fixed left-0 z-10 h-[91.1dvh] w-dvw bg-slate-600/20 backdrop-blur-sm;
	}
	.config {
		@apply flex flex-col px-3 py-2;
		@apply absolute right-auto z-10 sm:right-0;
		@apply h-full w-dvw bg-white sm:w-[68dvw] md:w-[24rem];
		@apply shadow-md;

		&-header {
			@apply py-2 text-xs font-semibold uppercase text-slate-700;
		}

		&-input {
			@apply flex flex-col gap-y-1 rounded-md px-1 py-2 focus-within:shadow-md;
			@apply transition-all duration-300 ease-in-out;

			span {
				@apply text-xs text-slate-600;
			}

			input {
				@apply rounded-md bg-transparent p-1 text-xl font-semibold outline-none focus:bg-slate-200;
				@apply transition-all duration-300 ease-in-out;
			}
		}

		&-checkbox {
			@apply flex items-center gap-x-1 px-1 py-2;

			span {
				@apply text-xs text-slate-600;
			}
		}
	}
</style>
