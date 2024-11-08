import { get } from 'svelte/store';
import { htmlScripts } from './scripts';

export default function getSlide(): string[] {
	const WPSlide = Number(localStorage.getItem('WPSlide'));
	const WPComma = Number(localStorage.getItem('WPComma'));
	// Get html and change slightly
	let htmlValue = get(htmlScripts)
		.replace(/^<p>(.*)<\/p>$/, '$1')
		.replace(/%%.*?%%/g, '');

	const newLineReplace = includeNewline() ? ' [[nl]] ' : ' ';

	htmlValue = htmlValue.replace(/<\/p><p>/g, newLineReplace);

	//
	const sentences = htmlValue.trim().split(/(?<=\[\[nl\]\])\s*|(?<=[.!?:])\s+(?=\w)/);
	console.log('Get sentences: ', sentences.length);
	const validSentences: string[] = [];
	const uncloseTag: string[] = [];
	let validSentence = '';

	const tagHtml = /<[^/>]*>/;
	const closeTag = /<\/[^/>]*>/;

	for (const s_entries of sentences.entries()) {
		const index = s_entries[0];
		let sentence = s_entries[1];
		if (tagHtml.test(sentence)) {
			const match = sentence.match(tagHtml);
			if (match) uncloseTag.push(match[0]);
		}

		if (uncloseTag.length > 0 && !tagHtml.test(sentence)) sentence = uncloseTag.join('') + sentence;

		if (closeTag.test(sentence)) uncloseTag.pop();

		if (sentence.includes(',')) {
			const commaSentences = sentence.split(/(?<=[,])\s+/);

			for (const [i, s] of commaSentences.entries()) {
				console.log('Sentence: ', s);
				if (s.split(' ').length >= WPComma) {
					if (validSentence.trim() === '') {
						validSentences.push(closingTag(s, uncloseTag));
					} else {
						validSentence = validSentence + ' ' + s;

						if (validSentence.split(' ').length >= WPComma) {
							validSentences.push(closingTag(validSentence, uncloseTag));
							validSentence = '';
						}
					}
				} else {
					validSentence = validSentence + ' ' + s;

					if (commaSentences.length === i + 1 && validSentence.split(/\s+/).length >= WPSlide) {
						validSentences.push(closingTag(validSentence, uncloseTag));
						validSentence = '';
					}
				}
			}
		} else if (
			(sentence.split(/\s+/).length >= WPSlide || sentence.endsWith('[[nl]]')) &&
			validSentence === ''
		) {
			validSentences.push(closingTag(sentence, uncloseTag));
		} else {
			validSentence = validSentence + ' ' + sentence;

			if (validSentence.split(/\s+/).length >= WPSlide) {
				validSentences.push(closingTag(validSentence, uncloseTag));
				validSentence = '';
			}
		}

		if (sentences.length === index + 1 && validSentence !== '') {
			validSentences.push(closingTag(validSentence, uncloseTag));
		}
	}

	console.log('Total slides: ', validSentences.length);

	return validSentences;
}

function closingTag(sentence: string, uncloseTag: string[]): string {
	if (uncloseTag.length > 0)
		return sentence.replace('[[nl]]', '').trim() + uncloseTag.reverse().join('');
	else return sentence.replace('[[nl]]', '').trim();
}

const includeNewline = (): boolean => {
	const newline = localStorage.getItem('includeNewline');

	if (newline === '1') return true;
	else return false;
};
