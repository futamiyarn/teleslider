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
import CharacterCount from '@tiptap/extension-character-count';
import { Markdown } from 'tiptap-markdown';
import { charCountConfig } from './counting';

export const editor: (element: HTMLElement) => Editor = (element: HTMLElement) => {
	return new Editor({
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
			Comments,
			Markdown,

			CharacterCount.configure(charCountConfig)
		]
	});
};
