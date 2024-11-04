import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		comments: {
			toggleComments: () => ReturnType;
		};
	}
}

export default Extension.create({
	name: 'comments',

	addCommands() {
		return {
			toggleComments:
				() =>
				({ tr, state, dispatch }) => {
					const { from, to } = state.selection;
					const text = state.doc.textBetween(from, to);

					if (text.startsWith('%%') && text.endsWith('%%')) {
						if (dispatch) {
							tr.insertText(text.slice(2, -2), from, to);
						}
					} else {
						if (dispatch) {
							tr.insertText(`%%${text}%%`, from, to);
						}
					}

					return dispatch ? true : tr.steps.length > 0;
				}
		};
	},

	addKeyboardShortcuts() {
		return {
			'Mod-Shift-c': () => this.editor.commands.toggleComments()
		};
	}
});
