import mammoth from 'mammoth';
import markdownit from 'markdown-it';
import { Editor } from '@tiptap/core';
import { charCount, currentId, sentenceCount, wordCount } from './scripts';
import getId from './getId';
import { countSentences } from './counting';

export function handleFile(event: Event, editor: Editor | undefined) {
	const input = event.target as HTMLInputElement;
	if (!input.files) return;
	const file = input.files[0];
	const reader = new FileReader();
	reader.onload = async (e) => {
		let data: string = '';

		if (file.name.endsWith('.docx')) {
			const arrayBuffer = e.target!.result as ArrayBuffer;
			try {
				const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
				data = parseHTML(result.value);
			} catch (error) {
				console.error('Error converting DOCX to HTML:', error);
			}
		} else if (file.name.endsWith('.md')) {
			const text = e.target!.result as string;
			const md = markdownit();

			data = parseHTML(md.render(text));
		} else if (file.name.endsWith('.txt')) {
			const text = e.target!.result as string;
			const lines = text.split('\n');
			const html = lines.map((line) => `<p>${line}</p>`).join('');
			data = parseHTML(html);
		} else if (file.name.endsWith('.html')) {
			const parser = new DOMParser();
			const doc = parser.parseFromString(e.target!.result as string, 'text/html');
			const body = doc.body;
			const html = body ? body.innerHTML : doc.documentElement.innerHTML;
			data = parseHTML(html);
		} else {
			console.log('Unsupported file type');
			return;
		}

		if (data !== '') {
			editor?.commands.setContent(data);
			currentId.set(getId(editor?.getText() ?? ''));

			wordCount.set(editor?.storage.characterCount.words() ?? 0);
			charCount.set(editor?.storage.characterCount.characters() ?? 0);
			sentenceCount.set(countSentences(editor?.getText() ?? ''));
		}
	};
	if (file.name.endsWith('.docx')) reader.readAsArrayBuffer(file);
	else reader.readAsText(file);
}

function parseHTML(html: string): string {
	const allowedTag = ['p', 'b', 'i', 'u', 's', 'code', 'strong', 'span', 'br'];
	const modifiedTag = ['ul', 'ol', 'table', 'tr', 'td'];
	const childModTag = ['li'];

	// console.log(html);

	const modTagRegex = new RegExp(`<(\\/?)(${modifiedTag.join('|')})>`, 'g');
	const childModTagRegex = new RegExp(`<(\\/?)(${childModTag.join('|')})>`, 'g');

	html = html.replace(modTagRegex, '');
	html = html.replace(childModTagRegex, (_match, p1) => (p1 ? '</p>' : '<p>'));
	const parser = new DOMParser();

	const doc = parser.parseFromString(html, 'text/html');
	const body = doc.body;
	if (!body) return '';
	const elements = body.querySelectorAll('*');
	elements.forEach((element) => {
		const tag = element.tagName.toLowerCase();
		if (!allowedTag.includes(tag)) {
			element.remove();
		}
	});

	return doc.documentElement.innerHTML;
}
