<script lang="ts">
	import { goto } from '$app/navigation';
	import { scriptStores } from '$lib/stores/scripts';
	import { onDestroy, onMount } from 'svelte';
	import iro from '@jaames/iro';

	import ConfigIcon from '$lib/icons/config.svelte';
	import InvertIcon from '$lib/icons/invert.svelte';
	import BackIcon from '$lib/icons/back.svelte';
	import ForwardIcon from '$lib/icons/forward.svelte';
	import PlusIcon from '$lib/icons/plus.svelte';
	import MinusIcon from '$lib/icons/minus.svelte';

	let messages: string[] = [];
	let currentIndex = 1;
	let colorPicker: any;
	let pickerName: string;
	let picker = 0;
	let configVisible = false;

	let backgroundColor = '#000000';
	let textColor = '#ffffff';
	let fontSize = 0;

	const revertColor = () => {
		const oldBgColor = backgroundColor;
		backgroundColor = textColor;
		textColor = oldBgColor;
	};

	const unsubscribe = scriptStores.subscribe((value) => {
		messages = value;

		if (messages.length === 0) return;

		document.addEventListener('keydown', handleKeyDown);

		document.addEventListener('mousedown', (e) => {
			if (e.button === 2) return;

			if (e.target && (e.target as HTMLElement).closest('#slide')) {
				if (picker === 0) handleClick(e);
			}
			if (e.target && !(e.target as HTMLElement).closest('.color-picker')) {
				if ((e.target as HTMLElement).closest('.bg-color-picker')) {
					picker != 1 ? (picker = 1) : (picker = 0);

					if (picker === 1) {
						colorPicker.color.hexString = backgroundColor;
						pickerName = 'Background';
					}
					//
				} else if ((e.target as HTMLElement).closest('.text-color-picker')) {
					picker != 2 ? (picker = 2) : (picker = 0);

					if (picker === 2) {
						colorPicker.color.hexString = textColor;
						pickerName = 'Text';
					}
				} else {
					picker = 0;
				}
			}
		});
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'd' || e.key === 'ArrowRight') {
			currentIndex = Math.min(currentIndex + 1, messages.length - 1);
		} else if (e.key === 'a' || e.key === 'ArrowLeft') {
			currentIndex = Math.max(currentIndex - 1, 0);
		} else if (e.key === 'Escape') {
			goto('/');
		}
	}

	function handleClick(e: MouseEvent) {
		const middle = window.innerWidth / 2;
		if (e.clientX < middle) {
			currentIndex = Math.max(currentIndex - 1, 1);
		} else {
			currentIndex = Math.min(currentIndex + 1, messages.length);
		}
	}

	onMount(() => {
		fontSize = Math.floor(window.innerWidth / 27);

		colorPicker = new (iro.ColorPicker as any)('#color-picker', {
			width: 130,
			color: backgroundColor
		});

		colorPicker.on('color:change', (color: any) => {
			if (picker === 1) backgroundColor = color.hexString;
			else if (picker === 2) textColor = color.hexString;
		});
	});

	const incrementFontSize = () => (fontSize = Math.min(fontSize + 1, 100));
	const decrementFontSize = () => (fontSize = Math.max(fontSize - 1, 8));

	onDestroy(() => {
		unsubscribe();
	});
</script>

<svelte:head>
	{#if messages.length < 1}
		<meta http-equiv="refresh" content="0; URL=/" />
	{/if}
</svelte:head>

<div
	class="text-container"
	id="slide"
	style="background-color: {backgroundColor}; color: {textColor}; font-size: {fontSize}px;"
>
	{#if messages.length > 0}
		<p class="text">{messages[currentIndex - 1]}</p>
	{:else}
		<p class="text">redirect...</p>
	{/if}
</div>

<button class="config-btn" on:click={() => (configVisible = !configVisible)}><ConfigIcon /></button>

<div class="color-picker" class:active-picker={picker === 1 || picker === 2}>
	<span>{pickerName}</span>
	<div id="color-picker"></div>
</div>

<nav class="script-settings" class:active-config={configVisible}>
	<div class="script-settings__area">
		<div class="color-config">
			<div class="color-config__area">
				<button style="background-color: {backgroundColor}" class="bg-color-picker" />
				<button style="background-color: {textColor}" class="text-color-picker" />
			</div>
			<button on:click={revertColor} class="reverse-btn"><InvertIcon /></button>
		</div>

		<div class="font-size-control">
			<button on:click={decrementFontSize} class="control-btn"><MinusIcon /></button>
			<input
				type="number"
				class="mx-2"
				bind:value={fontSize}
				style={`width:calc(.5em + ${fontSize.toString().length}ch);`}
			/>
			<button on:click={incrementFontSize} class="control-btn"><PlusIcon /></button>
		</div>
	</div>
	<div class="navigation">
		<button on:click={() => (currentIndex = Math.max(currentIndex - 1, 1))} class="nav-btn">
			<BackIcon />
		</button>
		<div class="mx-2 flex w-fit flex-row flex-nowrap items-center text-nowrap">
			<input
				type="number"
				bind:value={currentIndex}
				style={`width:calc(.5em + ${currentIndex.toString().length}ch);`}
			/>
			/ {messages.length}
		</div>
		<button
			on:click={() => (currentIndex = Math.min(currentIndex + 1, messages.length))}
			class="nav-btn"
		>
			<ForwardIcon />
		</button>
	</div>
</nav>

<style lang="scss">
	.text-container {
		@apply flex h-svh items-center justify-center px-8;
	}

	.text {
		@apply text-center font-bold;
	}

	.script-settings {
		@apply fixed -bottom-36 left-1/2 flex w-screen -translate-x-1/2 flex-col items-center justify-center gap-y-2 bg-white bg-opacity-80 py-2 sm:w-auto sm:flex-row sm:gap-x-1 sm:gap-y-0 sm:rounded-md sm:p-4;

		&__area {
			@apply flex gap-x-1;
		}
	}

	.active-config {
		@apply bottom-0 sm:bottom-5;
	}

	.bg-color-picker,
	.text-color-picker {
		@apply h-8 w-8 cursor-pointer rounded-full border-2 border-black;
	}

	.color-picker {
		@apply fixed -bottom-80 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-y-2 rounded-md bg-white p-2;
		@apply font-semibold text-slate-600;
	}

	.font-size-control,
	.navigation,
	.color-config {
		@apply flex items-center;

		.control-btn,
		.nav-btn,
		.reverse-btn {
			@apply mx-2 cursor-pointer rounded-md border-none bg-gray-700 px-2.5 py-1 text-xl font-bold text-white transition-colors duration-200;

			:global(svg) {
				@apply my-1;
			}

			&:hover {
				@apply bg-gray-600;
			}
		}

		input[type='number'] {
			@apply bg-transparent py-1 text-center font-semibold;
		}
	}

	.color-config__area {
		@apply flex gap-x-1;
	}

	.active-picker {
		@apply bottom-[4.5rem] flex sm:bottom-24;
	}

	.config-btn {
		@apply fixed right-0 top-0 mr-2 mt-2 rounded-md bg-slate-600 px-2 py-2 text-xl font-bold text-white;
	}
</style>
