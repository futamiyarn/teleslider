<script lang="ts">
	import { Editor } from '@tiptap/core';
	import ExtText from '@tiptap/extension-text';
	import Underline from '@tiptap/extension-underline';
	import History from '@tiptap/extension-history';
	import Bold from '@tiptap/extension-bold';
	import Italic from '@tiptap/extension-italic';
	import Strike from '@tiptap/extension-strike';
	import Document from '@tiptap/extension-document';
	import Paragraph from '@tiptap/extension-paragraph';
	import Code from '@tiptap/extension-code';
	import Comments from '$lib/stores/comment';

	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import { htmlScripts, textScripts } from '$lib/stores/scripts';
	import Undo from '$lib/icons/undo.svelte';
	import Redo from '$lib/icons/redo.svelte';
	import Formatbold from '$lib/icons/formatBold.svelte';
	import Formatitalic from '$lib/icons/formatItalic.svelte';
	import Formatunderlined from '$lib/icons/formatUnderlined.svelte';
	import FormatStrike from '$lib/icons/formatStrike.svelte';
	import FormatCode from '$lib/icons/formatCode.svelte';
	import CommentFormat from '$lib/icons/commentFormat.svelte';

	let element: HTMLElement;
	let editor: Editor | null = null;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				ExtText,
				Underline,
				History,
				Bold,
				Italic,
				Strike,
				Document,
				Paragraph,
				Code,
				Comments
			],
			onUpdate() {
				textScripts.set(editor?.getText() || '');
				htmlScripts.set(editor?.getHTML() || '');
			},
			onPaste: (event) => {
				textScripts.set(editor?.getText() || '');
				htmlScripts.set(editor?.getHTML() || '');
			},
			onTransaction: () => {
				editor = editor;
			}
		});

		if (get(htmlScripts) !== '') {
			//editor?.chain().focus().insertContent(get(originalScripts)).run();
			editor.commands.setContent(get(htmlScripts));
		}

		textScripts.set(editor?.getText() || '');
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

<div class="editor">
	{#if editor}
		<div class="editor-button">
			<button
				on:click={() => editor?.chain().focus().undo().run()}
				disabled={!editor?.can().undo()}
			>
				<Undo />
			</button>
			<button
				on:click={() => editor?.chain().focus().redo().run()}
				disabled={!editor?.can().redo()}
			>
				<Redo />
			</button>
			<button
				on:click={() => editor?.chain().focus().toggleBold().run()}
				class:active={editor.isActive('bold')}
			>
				<Formatbold />
			</button>
			<button
				on:click={() => editor?.chain().focus().toggleItalic().run()}
				class:active={editor.isActive('italic')}
			>
				<Formatitalic />
			</button>
			<button
				on:click={() => editor?.chain().focus().toggleUnderline().run()}
				class:active={editor.isActive('underline')}
			>
				<Formatunderlined />
			</button>
			<button
				on:click={() => editor?.chain().focus().toggleStrike().run()}
				class:active={editor.isActive('strike')}
			>
				<FormatStrike />
			</button>
			<button
				on:click={() => editor?.chain().focus().toggleCode().run()}
				class:active={editor.isActive('code')}
			>
				<FormatCode />
			</button>
			<button on:click={() => editor?.chain().focus().toggleComments().run()}
				><CommentFormat /></button
			>
		</div>
	{/if}

	<div bind:this={element} class="prose textarea" />
</div>

<style lang="scss">
	.editor {
		@apply flex h-full w-full flex-col-reverse md:flex-col;
	}

	.textarea {
		@apply h-full w-full overflow-hidden;
	}

	:global(.tiptap) {
		@apply h-full w-full resize-none overflow-y-auto bg-gray-100 p-2 outline-none dark:bg-gray-700 dark:text-white;
	}

	:global(p) {
		@apply my-2;
	}

	.editor-button {
		@apply flex justify-center bg-slate-400;

		button {
			@apply px-2 py-0.5 font-medium;
			@apply cursor-pointer transition duration-100 ease-in-out hover:bg-slate-300;

			:global(svg) {
				@apply aspect-square h-7;
			}

			&.active {
				@apply bg-slate-500 text-white;
			}

			&:disabled {
				@apply cursor-not-allowed opacity-50;
			}
		}
	}
</style>
