<script lang="ts">
	import CommentFormat from '$lib/icons/commentFormat.svelte';
	import Config from '$lib/icons/config.svelte';
	import FormatBold from '$lib/icons/formatBold.svelte';
	import FormatCode from '$lib/icons/formatCode.svelte';
	import FormatItalic from '$lib/icons/formatItalic.svelte';
	import FormatStrike from '$lib/icons/formatStrike.svelte';
	import FormatUnderlined from '$lib/icons/formatUnderlined.svelte';
	import Redo from '$lib/icons/redo.svelte';
	import Undo from '$lib/icons/undo.svelte';

	import { onMount } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import OpenFile from '$lib/icons/openFile.svelte';
	import { handleFile } from '$lib/stores/importFile';
	import MsgBox from './msg-box.svelte';
	import { get } from 'svelte/store';
	import ConfigBox from './config-box.svelte';
	import { currentId, htmlScripts, scriptLoaded, scriptStores } from '$lib/stores/scripts';
	import getSlide from '$lib/stores/slide';
	import { goto } from '$app/navigation';

	// #region variables
	export let editor: Editor | undefined;

	let scrollableElement: HTMLElement | null = null;
	let startX: number = 0;
	let scrollLeft: number = 0;
	let isDragging: boolean = false;
	let hasFilledText: boolean = false;
	let isConfigVisible: boolean = false;
	// #endregion

	// #region scroll navbar functions
	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		const touch = e.touches[0];
		startX = touch.pageX - scrollableElement!.offsetLeft;
		scrollLeft = scrollableElement!.scrollLeft;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		const touch = e.touches[0];
		const x = touch.pageX - scrollableElement!.offsetLeft;
		const walk = (x - startX) * 2; // The '2' here controls the scrolling speed.
		scrollableElement!.scrollLeft = scrollLeft - walk; // Scroll horizontally
	}

	function handleTouchEnd() {
		isDragging = false;
	}

	function handleScroll(e: WheelEvent) {
		const target = e.currentTarget as HTMLElement;

		if (e.deltaY !== 0) {
			e.preventDefault();
			target.scrollLeft += e.deltaY;
		}
	}
	// #endregion

	// #region file import functions
	function importFile(e: Event) {
		if (editor?.getText() !== '') hasFilledText = true;
		else getFile();
	}

	function getFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.docx, .txt, .md, .html';
		input.onchange = (e) => handleFile(e, editor);
		input.click();
	}
	// #endregion

	function configEvent() {
		isConfigVisible = !isConfigVisible;

		if (!isConfigVisible) editor?.chain().focus().run();
	}

	function handleClick(this: Window, ev: MouseEvent) {
		const target = ev.target as HTMLElement;
		if (
			isConfigVisible &&
			!target.closest('#config') &&
			!target.closest('.navbar') &&
			!target.closest('.text-count')
		) {
			isConfigVisible = false;
			editor?.chain().focus().run();
		}
	}

	onMount(() => {
		window.addEventListener('click', handleClick);

		scrollableElement = document.querySelector('.navbar-modifier');

		if (scrollableElement) {
			// Add wheel scroll listener
			scrollableElement.addEventListener('wheel', handleScroll, { passive: false });

			// Add touch events for swipe support
			scrollableElement.addEventListener('touchstart', handleTouchStart);
			scrollableElement.addEventListener('touchmove', handleTouchMove);
			scrollableElement.addEventListener('touchend', handleTouchEnd);
		}

		return () => {
			if (scrollableElement) {
				scrollableElement.removeEventListener('wheel', handleScroll);
				scrollableElement.removeEventListener('touchstart', handleTouchStart);
				scrollableElement.removeEventListener('touchmove', handleTouchMove);
				scrollableElement.removeEventListener('touchend', handleTouchEnd);
			}
		};
	});

	function runSlide(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
		htmlScripts.set(editor?.getHTML() || '');
		scriptStores.set(getSlide());

		const id = get(currentId);

		const storedScripts = JSON.parse(localStorage.getItem('savedScripts') || '[]');
		let scriptExist = storedScripts.find((script: any) => script.id === id);

		if (!scriptExist) {
			scriptExist = { id, currentPage: 1 };
			storedScripts.push(scriptExist);
			localStorage.setItem('savedScripts', JSON.stringify(storedScripts));
		}

		scriptLoaded.set(scriptExist);
		console.log(`Get ID: ${id} in current slide `, scriptExist.currentPage);
		goto('/read');
	}
</script>

<nav class="navbar">
	<div class="navbar-container">
		<div class="navbar-modifier">
			<button disabled={isConfigVisible} class="navbar-modifier__button" on:click={importFile}>
				<OpenFile />
			</button>
			<button
				class="navbar-modifier__button"
				disabled={!editor?.can().undo() || isConfigVisible}
				on:click={() => editor?.chain().focus().undo().run()}><Undo /></button
			>
			<button
				class="navbar-modifier__button"
				disabled={!editor?.can().redo() || isConfigVisible}
				on:click={() => editor?.chain().focus().redo().run()}><Redo /></button
			>
			<span class="navbar-modifier__separator"></span>
			<button
				class="navbar-modifier__button"
				disabled={isConfigVisible}
				on:click={() => editor?.chain().focus().toggleBold().run()}
				class:active={editor?.isActive('bold')}><FormatBold /></button
			>
			<button
				class="navbar-modifier__button"
				disabled={isConfigVisible}
				on:click={() => editor?.chain().focus().toggleItalic().run()}
				class:active={editor?.isActive('italic')}><FormatItalic /></button
			>
			<button
				class="navbar-modifier__button"
				disabled={isConfigVisible}
				on:click={() => editor?.chain().focus().toggleUnderline().run()}
				class:active={editor?.isActive('underline')}><FormatUnderlined /></button
			>
			<button
				class="navbar-modifier__button"
				disabled={isConfigVisible}
				on:click={() => editor?.chain().focus().toggleStrike().run()}
				class:active={editor?.isActive('strike')}><FormatStrike /></button
			>
			<button
				class="navbar-modifier__button"
				disabled={isConfigVisible}
				on:click={() => editor?.chain().focus().toggleCode().run()}
				class:active={editor?.isActive('code')}><FormatCode /></button
			>
			<button
				class="navbar-modifier__button"
				disabled={isConfigVisible}
				on:click={() => editor?.chain().focus().toggleComments().run()}><CommentFormat /></button
			>

			<span class="navbar-modifier__separator"></span>
			<button class="navbar-modifier__button" on:click={configEvent} class:active={isConfigVisible}
				><Config /></button
			>
		</div>
		<div class="navbar-submitter">
			<button
				class="navbar-submitter__button"
				disabled={!editor?.getText() || isConfigVisible}
				on:click={runSlide}>Read It!</button
			>
		</div>
	</div>
</nav>

<ConfigBox {isConfigVisible} />

<MsgBox isOpen={hasFilledText} closeButton={() => (hasFilledText = false)}>
	<div slot="title">Warning!</div>
	<div slot="body">
		Importing will replace any existing text. Please back up your current text to your preferred
		text editor if don't have it.
	</div>

	<div slot="buttons" class="flex gap-x-2">
		<button
			class="bg-slate-700"
			on:click={() => {
				hasFilledText = false;
				getFile();
			}}>Continue</button
		>
		<button on:click={() => (hasFilledText = false)}>Close</button>
	</div>
</MsgBox>

<style lang="scss">
	.navbar {
		@apply fixed bottom-0 z-20 flex w-screen items-center justify-center md:sticky md:bottom-auto md:top-0;
		@apply bg-slate-100;

		&::after {
			@apply absolute left-0 top-0 -z-10 h-full w-full content-[""];

			@apply md:shadow-md;
		}

		&-container {
			@apply container flex justify-between px-3;
		}

		&-modifier {
			@apply flex items-center whitespace-nowrap sm:w-full sm:justify-center;

			@apply touch-pan-y overflow-hidden overflow-x-auto scroll-smooth;

			scrollbar-width: none; /* For Firefox */
			-ms-overflow-style: none; /* For Internet Explorer and Edge */

			/* Hide scrollbar for WebKit-based browsers (Chrome, Safari, Opera) */
			&::-webkit-scrollbar {
				display: none;
			}

			&__separator {
				@apply inline-block h-[75%] border-spacing-x-px border-l border-slate-300 py-px;
			}

			&__button {
				@apply inline-flex aspect-square items-center justify-center px-2 py-1 text-3xl hover:bg-slate-300 md:text-xl;

				@apply disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-100;

				&.active {
					@apply bg-slate-300;
				}
			}
		}

		&-submitter {
			@apply flex px-2;

			&__button {
				@apply inline-flex items-center justify-center text-nowrap bg-slate-200 px-2 py-1 font-semibold hover:bg-slate-400;

				@apply disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-200;
			}
		}
	}

	button {
		transition: all 0.25s ease-in-out;
		cursor: pointer;
	}
</style>
