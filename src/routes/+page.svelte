<script lang="ts">
	import { browser } from '$app/environment';

	import Navbar from '$lib/components/navbar.svelte';
	import TextCount from '$lib/components/text-count.svelte';
	import MsgBox from '$lib/components/msg-box.svelte';
	import { editor as Editors } from '$lib/stores/tiptap';
	import { Editor } from '@tiptap/core';
	import { onMount } from 'svelte';
	import {
		charCount,
		currentId,
		htmlScripts,
		sentenceCount,
		textScripts,
		wordCount
	} from '$lib/stores/scripts';
	import getId from '$lib/stores/getId';
	import { countSentences } from '$lib/stores/counting';
	import { get } from 'svelte/store';

	let editor: Editor;
	let element: HTMLElement;
	let dontShowAgain = !browser || localStorage.getItem('dontShowAgain') === 'true';
	let isOpenImportant = true;

	function updateEditor() {
		htmlScripts.set(editor.getHTML());
		textScripts.set(editor.getText());
		currentId.set(getId());

		wordCount.set(editor.storage.characterCount.words() ?? 0);
		charCount.set(editor.storage.characterCount.characters() ?? 0);
		sentenceCount.set(countSentences(editor.getText()));
	}

	onMount(() => {
		editor = Editors(element);
		editor.on('create', getExistingScripts);
		editor.on('transaction', () => (editor = editor));
		editor.on('update', updateEditor);
		editor.on('paste', updateEditor);

		window.addEventListener('keydown', (e) => {
			if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();

				if (editor) editor.chain().focus().selectAll().run();
			}
		});
	});

	function closeImportant() {
		isOpenImportant = false;
	}

	function getExistingScripts(props_0: { editor: Editor }) {
		editor?.chain().focus().run();
		editor.commands.setContent(get(htmlScripts));
	}
</script>

<main>
	<Navbar {editor} />
	<div class="editor prose lg:prose-xl" bind:this={element}></div>
	<TextCount />

	<!-- IMPORTANT!!! -->

	<MsgBox isOpen={!dontShowAgain && isOpenImportant}>
		<div slot="title">Important!</div>
		<div slot="body">
			This is not a text editor app and your text may be lost when you refresh your browser or close
			this app. Please use a dedicated text editor app.
		</div>

		<div slot="buttons" class="flex gap-x-2">
			<button on:click={closeImportant}>OK</button>
			<button
				on:click={() => {
					localStorage.setItem('dontShowAgain', 'true');
					dontShowAgain = true;
				}}
			>
				Don't show again
			</button>
		</div>
	</MsgBox>
</main>

<style lang="scss">
	.editor {
		@apply mb-8 mt-5 flex h-[94.5dvh] w-screen flex-col items-center justify-center bg-slate-100;

		:global(.tiptap) {
			@apply container h-full overflow-hidden overflow-y-scroll p-3 text-justify;
			@apply bg-white shadow-sm outline-none focus:shadow-lg;
			@apply transition-all duration-300 ease-in-out;
		}
	}
</style>
