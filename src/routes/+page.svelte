<script lang="ts">
	import { scriptStores, originalScripts } from '$lib/stores/scripts.js';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	import ConfigIcon from '$lib/icons/config.svelte';

	let inputValue = get(originalScripts) || '';

	let scriptContent = '';
	let characters = 0;
	let sentences = 0;
	let words = 0;
	let totalMinutes = 0;
	let wordsPerMinute = 0;

	let WPMScale = 0; // default value
	let WPSScale = 0; // default value

	let includeComma: boolean | null = null;

	// Check if 'window' exists to make sure it's running in the browser
	if (typeof window !== 'undefined') {
		WPMScale = localStorage.getItem('WPMScale') ? Number(localStorage.getItem('WPMScale')) : 200;
		WPSScale = localStorage.getItem('WPSScale') ? Number(localStorage.getItem('WPSScale')) : 8;
		includeComma =
			localStorage.getItem('includeComma') === '1'
				? true
				: localStorage.getItem('includeComma') === '0'
					? false
					: true;
	}

	$: {
		scriptContent = inputValue.replace(/\[\[.*?\]\]/g, '');
		characters = scriptContent.length;
		sentences = (scriptContent.match(/[.!?]+/g) || []).length;
		words = scriptContent.length < 1 ? 0 : scriptContent.trim().split(/\s+/).length;
		totalMinutes = words / WPMScale;
		wordsPerMinute = words / (totalMinutes || 1);

		if (WPMScale > 0) localStorage.setItem('WPMScale', WPMScale.toString());
		if (WPSScale > 0) localStorage.setItem('WPSScale', WPSScale.toString());
		if (includeComma !== null) localStorage.setItem('includeComma', includeComma ? '1' : '0');
	}

	const slide = () => {
		if (!inputValue.trim()) {
			alert('Please enter some text');
			return;
		}

		let newtext = scriptContent.replace(/\n+/g, ' ');

		let words = newtext.trim().split(/\s+/);
		let validSentences = [];

		let validSentence = '';

		for (const word of words) {
			validSentence += ' ' + word;

			if (validSentence.trim().split(/\s+/).length >= WPSScale) {
				if (word.includes('.') || word.includes(',') || word.includes('?') || word.includes('!')) {
					validSentences.push(validSentence);
					validSentence = '';
				}
			}
		}

		if (validSentences.length === 0) validSentences.push(validSentence);

		// Send valid sentences to the store
		scriptStores.set(validSentences);
		originalScripts.set(inputValue);
		goto('/read');
	};

	let isConfigVisible = false;
	let isMobile = false;

	function openConfig() {
		isConfigVisible = !isConfigVisible;
	}

	function updateLayout() {
		isMobile = window.innerWidth < 768; // Adjust this breakpoint as needed
	}

	onMount(() => {
		updateLayout();
		window.addEventListener('resize', updateLayout);
		return () => window.removeEventListener('resize', updateLayout);
	});
</script>

<svelte:head>
	<title>TeleSlider - Teleprompter but slide</title>
</svelte:head>

<main class="editor">
	<section class="editor-header">
		<div class="detail-text">
			<span>{words} Words</span>
			<span>{characters} Characters</span>
			<span>{sentences} Sentences</span>
			<span>{totalMinutes.toFixed(1)} Minutes</span>
		</div>
		<div class="buttons">
			{#if isMobile}
				<button on:click={openConfig}> <ConfigIcon /> <span>Config</span> </button>
			{/if}
			<button on:click={slide}> Read it! </button>
		</div>
	</section>
	<div class="editor-content">
		<section class="editor-text" class:full-width={isMobile}>
			<textarea class="textarea" bind:value={inputValue} placeholder="Input Script here"></textarea>
		</section>
		{#if !isMobile || (isMobile && isConfigVisible)}
			<section class="editor-config" class:mobile={isMobile}>
				<label class="number">
					<span>Words per minute:</span>
					<input type="number" min="100" max="500" step="5" bind:value={WPMScale} />
				</label>
				<label class="number">
					<span>Min words per slide:</span>
					<input type="number" min="5" max="100" bind:value={WPSScale} />
				</label>
				<label class="checkbox">
					<input type="checkbox" bind:checked={includeComma} />
					<span>Include commas</span>
				</label>
			</section>
		{/if}
	</div>
</main>

<style lang="scss">
	.editor {
		@apply flex h-dvh w-screen flex-col-reverse md:flex-col;
	}

	.editor-header {
		@apply z-20 flex w-full flex-col items-center space-y-1 bg-white px-3 py-1 shadow-sm sm:flex-row sm:justify-between sm:space-y-0 dark:bg-gray-800 dark:text-white;
	}

	.editor-content {
		@apply relative flex w-full flex-grow;
	}

	.editor-text {
		@apply flex h-dvh w-full items-center;

		.textarea {
			@apply h-full w-full resize-none border-none bg-gray-100 p-2 outline-none dark:bg-gray-700 dark:text-white;
		}
	}

	.editor-config {
		@apply flex w-1/4 flex-col overflow-y-auto bg-gray-200 p-4 dark:bg-gray-900;

		label {
			@apply flex py-2;

			span {
				@apply text-xs font-light text-slate-600 dark:text-slate-300;
			}

			&.number {
				@apply flex-col;

				input {
					@apply w-full rounded-md border border-none bg-transparent p-1 text-xl font-semibold dark:text-white;
				}
			}

			&.checkbox {
				@apply flex-row items-center space-x-2;

				span {
					@apply text-sm font-normal text-slate-600 dark:text-slate-300;
				}
			}
		}

		&.mobile {
			@apply absolute inset-0 z-10 h-dvh w-full;
		}
	}

	.detail-text {
		@apply flex items-center space-x-2 py-1 text-xs text-slate-600 sm:py-0 dark:text-slate-300;
	}

	@media (min-width: 768px) {
		.editor-text {
			width: 75%;
		}
	}

	.buttons {
		@apply flex items-center gap-x-2 py-1.5 md:gap-x-0;

		button {
			@apply flex items-center justify-center gap-x-1 rounded-md bg-slate-700 px-2 py-1 font-semibold text-white hover:bg-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500;

			:global(svg) {
				@apply my-1;
			}
		}
	}
</style>
