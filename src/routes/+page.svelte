<script lang="ts">
	import Tiptap from '$lib/components/Tiptap.svelte';
	import { htmlScripts, scriptLoaded, scriptStores, textScripts } from '$lib/stores/scripts.js';
	import { onDestroy, onMount } from 'svelte';
	import ConfigIcon from '$lib/icons/config.svelte';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	import * as CryptoJS from 'crypto-js';
	import { browser } from '$app/environment';

	// #region State variables
	let scriptContent = '';
	let characters = 0;
	let sentences = 0;
	let words = 0;
	let totalMinutes = 0;
	let wordsPerMinute = 0;

	let WPMScale = 200;
	let WPSScale = 8;

	let includeComma = true;
	let includeNewline = false;

	let isConfigVisible = false;
	let isMobile = false;
	let scriptID = '';
	// #endregion

	// #region Local storage functions
	function loadLocalStorageSettings() {
		if (browser) {
			WPMScale = Number(localStorage.getItem('WPMScale')) || 200;
			WPSScale = Number(localStorage.getItem('WPSScale')) || 8;
			includeComma = localStorage.getItem('includeComma') !== '0';
			includeNewline = localStorage.getItem('includeNewline') === '1';

			scriptID = getExistScriptId();
		}
	}

	function saveLocalStorageSettings() {
		if (browser) {
			localStorage.setItem('WPMScale', WPMScale.toString());
			localStorage.setItem('WPSScale', WPSScale.toString());
			localStorage.setItem('includeComma', includeComma ? '1' : '0');
			localStorage.setItem('includeNewline', includeNewline ? '1' : '0');
		}
	}
	// #endregion

	// #region Helper functions
	function countSentences(content: string): number {
		if (content.length === 0) return 0;
		if (content.split(/\s+/).length === 1) return 1;

		let sentenceCount = (content.match(/[.!?]+/g) || []).length;
		if (sentenceCount === 0) sentenceCount = 1;
		if (!/[.!?]$/.test(content)) sentenceCount += 1;

		return sentenceCount;
	}

	function updateLayout() {
		if (browser) {
			isMobile = window.innerWidth < 768;
		}
	}
	// #endregion

	// #region Main functions
	function processScriptContent(content: string) {
		const cleanContent = content.replace(/\/\[.*?\]\//g, '');
		characters = cleanContent.length;
		sentences = countSentences(cleanContent);
		words = cleanContent.length < 1 ? 0 : cleanContent.trim().split(/\s+/).length;
		totalMinutes = words > 0 ? words / WPMScale : 0;
		wordsPerMinute = totalMinutes > 0 ? words / totalMinutes : 0;

		scriptID = getExistScriptId();
	}

	function getExistScriptId() {
		const inputValue = get(textScripts);
		if (!inputValue.trim() || inputValue.trim() === '') return '';

		const id =
			inputValue.match(/\/\[id:(.*)?\]\//)?.[1] ||
			CryptoJS.MD5(inputValue.slice(0, 100)).toString();

		const scriptExist = JSON.parse(localStorage.getItem('savedScripts') || '[]').find(
			(script: any) => script.id === id
		);

		return scriptExist?.id || '';
	}

	function slide() {
		const inputValue = get(textScripts);
		if (!inputValue.trim()) {
			alert('Please enter some text');
			return;
		}

		const id =
			inputValue.match(/\/\[id:(.*)?\]\//)?.[1] ||
			CryptoJS.MD5(inputValue.slice(0, 100)).toString();

		const htmlValue = get(htmlScripts)
			.replace(/^<p>(.*)<\/p>$/, '$1')
			.replace(/\/\[.*?\]\//g, '');
		const newLineReplace = includeNewline ? ' [[nl]] ' : ' ';
		let markdown = htmlValue.replace(/<\/p><p>/g, newLineReplace);

		const validSentences = processMarkdown(markdown);

		updateScriptStore(id, validSentences);
		goto('/read');
	}

	function processMarkdown(markdown: string): string[] {
		const words = markdown.trim().split(/\s+/);
		let validSentences: string[] = [];
		let uncloseTag: string[] = [];
		let validSentence = '';

		for (const [index, word] of words.entries()) {
			validSentence = updateValidSentence(word, validSentence, uncloseTag);
			uncloseTag = updateUncloseTags(word, uncloseTag);

			if (shouldEndSentence(word, index, words.length, validSentence)) {
				validSentence = closeSentence(validSentence, uncloseTag, word);
				validSentences.push(validSentence.trim());
				validSentence = '';
			}
		}

		return validSentences;
	}

	function updateValidSentence(word: string, sentence: string, uncloseTag: string[]): string {
		if (word === '[[nl]]') return sentence;
		return (
			sentence + ' ' + (uncloseTag.length > 0 && sentence === '' ? uncloseTag.join() : '') + word
		);
	}

	function updateUncloseTags(word: string, uncloseTag: string[]): string[] {
		const tagHtml = /^<[^>]*>/;
		const closeTag = /<\/[^>]*>$/;
		if (tagHtml.test(word)) {
			const match = word.match(tagHtml);
			if (match) uncloseTag.push(match[0]);
		}
		if (closeTag.test(word)) uncloseTag.pop();
		return uncloseTag;
	}

	function shouldEndSentence(
		word: string,
		index: number,
		totalWords: number,
		validSentence: string
	): boolean {
		const regex = includeComma ? /[.,?!:]$/ : /[^.?!:]/;
		const lastChar = word.slice(-1);
		return (
			(regex.test(word) &&
				['.', ':', '?', '!'].includes(lastChar) &&
				(validSentence.trim().split(/\s+/).length >= WPSScale ||
					(includeNewline && word === '[[nl]]'))) ||
			index === totalWords - 1
		);
	}

	function closeSentence(sentence: string, uncloseTag: string[], word: string): string {
		const closeTag = /<\/[^>]*>$/;
		if (!closeTag.test(word)) {
			sentence += uncloseTag
				.map((c) => c.replace('<', '</'))
				.reverse()
				.join('');
		}
		return sentence;
	}

	function updateScriptStore(id: string, validSentences: string[]) {
		if (browser) {
			const storedScripts = JSON.parse(localStorage.getItem('savedScripts') || '[]');
			let scriptExist = storedScripts.find((script: any) => script.id === id);

			if (!scriptExist) {
				scriptExist = { id, currentPage: 1 };
				storedScripts.push(scriptExist);
				localStorage.setItem('savedScripts', JSON.stringify(storedScripts));
			}

			scriptLoaded.set(scriptExist);
			scriptStores.set(validSentences);
		}
	}
	// #endregion

	// #region Event handlers
	function openConfig() {
		isConfigVisible = !isConfigVisible;
	}
	// #endregion

	// #region Lifecycle hooks
	onMount(() => {
		if (browser) {
			loadLocalStorageSettings();
			updateLayout();
			window.addEventListener('resize', updateLayout);
		}
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', updateLayout);
		}
	});
	// #endregion

	// #region Reactive statements
	$: {
		if (browser) {
			saveLocalStorageSettings();
		}
	}

	const unsubscribe = textScripts.subscribe((value) => {
		scriptContent = value;
		processScriptContent(scriptContent);
	});

	onDestroy(() => unsubscribe());
	// #endregion
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
			<Tiptap />
		</section>
		{#if !isMobile || (isMobile && isConfigVisible)}
			<section class="editor-config" class:mobile={isMobile}>
				<label class="number">
					<span>Words per minute</span>
					<input type="number" min="100" max="500" step="5" bind:value={WPMScale} />
				</label>
				<label class="number">
					<span>Min words per slide</span>
					<input type="number" min="5" max="100" bind:value={WPSScale} />
				</label>
				<label class="text">
					<span>ID Transcript</span>
					<input type="text" bind:value={scriptID} readonly />
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

			&.text {
				@apply flex-col;

				input {
					@apply w-full rounded-md border border-none bg-transparent p-1 dark:text-white;
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
