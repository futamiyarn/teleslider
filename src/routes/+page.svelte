<script lang="ts">
	import { originalScripts } from '$lib/stores/scripts.js';
	import { get } from 'svelte/store';
	import { onMount } from 'svelte';

	import TurndownService from 'turndown';

	import ConfigIcon from '$lib/icons/config.svelte';

	// #region variables

	let inputValue = get(originalScripts) || '';

	let scriptContent = '';
	let characters = 0;
	let sentences = 0;
	let words = 0;
	let totalMinutes = 0;
	let wordsPerMinute = 0;

	let WPMScale = 0;
	let WPSScale = 0;

	let includeComma: boolean | null = null;
	let includeNewline: boolean | null = null;

	// #endregion

	// #region local storage
	function localStorageFunc() {
		WPMScale = localStorage.getItem('WPMScale') ? Number(localStorage.getItem('WPMScale')) : 200;
		WPSScale = localStorage.getItem('WPSScale') ? Number(localStorage.getItem('WPSScale')) : 8;
		includeComma =
			localStorage.getItem('includeComma') === '1'
				? true
				: localStorage.getItem('includeComma') === '0'
					? false
					: true;

		includeNewline =
			localStorage.getItem('includeNewline') === '0'
				? false
				: localStorage.getItem('includeNewline') === '1'
					? true
					: false;
	}

	// #endregion

	$: {
		const turndownService = new TurndownService();
		scriptContent = turndownService.turndown(inputValue.replace(/\[\[.*?\]\]/g, ''));
		characters = scriptContent.length;
		sentences = countSentences(scriptContent);
		words = scriptContent.length < 1 ? 0 : scriptContent.trim().split(/\s+/).length;
		totalMinutes = words / WPMScale;
		wordsPerMinute = words / (totalMinutes || 1);

		if (WPMScale > 0) localStorage.setItem('WPMScale', WPMScale.toString());
		if (WPSScale > 0) localStorage.setItem('WPSScale', WPSScale.toString());
		if (includeComma !== null) localStorage.setItem('includeComma', includeComma ? '1' : '0');
		if (includeNewline !== null) localStorage.setItem('includeNewline', includeNewline ? '1' : '0');
	}

	function countSentences(scriptContent: string) {
		// If the script is empty, return 0 sentences
		if (scriptContent.length === 0) return 0;

		// If the content has only one word/character, return 1 sentence
		const wordCount = scriptContent.split(/\s+/).length;
		if (wordCount === 1) return 1;

		// Count sentences based on punctuation marks
		let sentenceCount = (scriptContent.match(/[.!?]+/g) || []).length;

		// If there are no punctuation marks but there is content, count as 1 sentence
		if (sentenceCount === 0) sentenceCount = 1;

		// If the content does not end with a punctuation mark, add 1 to the sentence count
		if (!/[.!?]$/.test(scriptContent)) sentenceCount += 1;

		return sentenceCount;
	}

	const slide = () => {
		if (!inputValue.trim()) {
			alert('Please enter some text');
			return;
		}

		let markdown = scriptContent.replace(/\n+/g, ' [[nl]] ');
		console.log(inputValue);

		let words = markdown.trim().split(/\s+/);
		console.log(words);

		let validSentences = [];

		let validSentence = '';

		for (const word of words) {
			if (word.trim() === '[[nl]]') {
				if (
					validSentence.trim() !== '' &&
					(validSentence.trim().endsWith('.') ||
						validSentence.trim().endsWith('?') ||
						validSentence.trim().endsWith('!'))
				) {
					validSentences.push(validSentence);
					validSentence = '';
				}
				continue;
			}

			validSentence += ' ' + word;

			if (validSentence.trim().split(/\s+/).length >= WPSScale) {
				if (word.includes('.') || word.includes('?') || word.includes('!')) {
					validSentences.push(validSentence);
					validSentence = '';
				} else if (word.includes(',') && includeComma) {
					validSentences.push(validSentence);
					validSentence = '';
				}
			}
		}

		console.log(validSentences);

		if (validSentences.length === 0) validSentences.push(validSentence);

		// // Send valid sentences to the store
		// scriptStores.set(validSentences);
		// originalScripts.set(inputValue);
		// goto('/read');
	};

	let isConfigVisible = false;
	let isMobile = false;

	function openConfig() {
		isConfigVisible = !isConfigVisible;
	}

	function updateLayout() {
		isMobile = window.innerWidth < 768; // Adjust this breakpoint as needed
	}

	function detectionTags() {
		//
	}

	onMount(() => {
		localStorageFunc();
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
			<div class="editor-controls">
				<button on:click={detectionTags}> <b>B</b> </button>
				<button on:click={detectionTags}> <i>I</i> </button>
				<button on:click={detectionTags}> <u>U</u> </button>
				<button on:click={detectionTags}> <s>S</s> </button>
			</div>
			<div class="textarea" contenteditable="true" id="textarea" bind:innerHTML={inputValue}></div>
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
				<label class="checkbox">
					<input type="checkbox" bind:checked={includeNewline} />
					<span>Include Newline (bypass Min Words)</span>
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
		// Boxing
		@apply flex w-full flex-col items-center;

		// Boxing (from Small)
		@apply sm:flex-row sm:justify-between;

		//spacing
		@apply space-y-1 px-3 py-1 sm:space-y-0;

		//styling
		@apply bg-white shadow-sm;

		// Dark mode
		@apply dark:bg-gray-800 dark:text-white;
	}

	.editor-content {
		@apply relative flex w-full flex-grow overflow-hidden;
	}

	.editor-text {
		@apply flex h-full w-full flex-col-reverse md:flex-col;

		.editor-controls {
			@apply flex items-center justify-center gap-x-1 bg-slate-900/70 p-1;

			button {
				@apply flex h-8 w-8 items-center justify-center rounded-md bg-slate-700 px-2 py-1 font-semibold text-white hover:bg-slate-500;
			}
		}

		.textarea {
			@apply h-full w-full resize-none overflow-y-auto bg-gray-100 p-2 outline-none dark:bg-gray-700 dark:text-white;
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
