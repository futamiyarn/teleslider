<script lang="ts">
	import Close from '$lib/icons/close.svelte';

	export let isOpen = false;
	export let closeButton = () => (isOpen = false);
</script>

{#if isOpen}
	<div class="blank" id="important-message">
		<div class="popup-modal">
			<div class="popup-modal__close">
				<button class="popup-modal__close-btn" on:click={closeButton}>
					<Close />
				</button>
			</div>
			<div class="popup-modal__content">
				<h1 class="popup-modal__title">
					<slot name="title">Example</slot>
				</h1>
				<p class="popup-modal__text">
					<slot name="body"
						>Lorem ipsum dolor sit amet consectetur adipisicing elit. Iure, provident nostrum!</slot
					>
				</p>
			</div>

			<div class="popup-modal__buttons">
				<slot name="buttons">
					<button on:click={closeButton}>OK</button>
				</slot>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.blank {
		@apply fixed left-0 top-0 z-30 h-full w-full bg-white/20 backdrop-blur-sm;
	}
	.popup-modal {
		@apply fixed z-50 flex flex-col items-center justify-center gap-y-1 rounded-lg p-4 shadow-md;
		@apply left-1/2 top-1/2 w-5/6 -translate-x-1/2 -translate-y-1/2 sm:w-2/3;
		@apply bg-white;

		&__content {
			@apply flex flex-col gap-y-2;
		}

		&__title {
			@apply text-xl font-bold;
		}

		&__text {
			@apply text-justify;
		}

		&__buttons {
			@apply flex w-full items-end justify-end;

			:global(button) {
				@apply flex items-center justify-center rounded-md bg-slate-200 px-3 py-1 shadow-sm hover:bg-slate-300;
			}
		}

		&__close {
			@apply flex h-fit w-full items-center justify-end text-xl;

			&-btn {
				@apply inline-flex items-center justify-center p-0.5 text-gray-500 hover:text-gray-600;
			}
		}
	}

	button {
		@apply transition-all duration-300 ease-in-out;
	}
</style>
