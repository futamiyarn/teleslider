<script lang="ts">
	import { browser } from '$app/environment';
	import { countWPM } from '$lib/stores/counting';
	import { charCount, sentenceCount, wordCount } from '$lib/stores/scripts';
	import { onDestroy } from 'svelte';

	let words: number = 0;
	let sentences: number = 0;
	let characters: number = 0;
	let totalMinutes: number = 0;

	const wordSub = wordCount.subscribe((value) => {
		const WPMScale = browser ? parseInt(localStorage.getItem('WPMScale') ?? '200') : 1;
		words = value;
		totalMinutes = countWPM(value, WPMScale);
	});

	const sentenceSub = sentenceCount.subscribe((v) => (sentences = v));
	const charSub = charCount.subscribe((v) => (characters = v));

	onDestroy(() => {
		wordSub;
		sentenceSub;
		charSub;
	});
</script>

<div class="text-count">
	<span class="text-count__words">Characters: {characters}</span>
	<span class="text-count__words">Words: {words}</span>
	<span class="text-count__words">Sentences: {sentences}</span>
	<span class="text-count__words">Minutes: {totalMinutes.toFixed(1)}</span>
</div>

<style>
	.text-count {
		@apply sticky z-20 flex items-center justify-center space-x-2;
		@apply w-full bg-white p-1 text-xs text-slate-600;
		@apply bottom-11 md:bottom-0;
		box-shadow: 0px -4px 6px -1px rgba(0, 0, 0, 0.2);
	}
</style>
