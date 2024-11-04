import * as CryptoJS from 'crypto-js';
import { textScripts } from './scripts';
import { get } from 'svelte/store';

export default function getId(text: string = '') {
	if (!text) text = get(textScripts);
	if (!text.trim()) return '';

	const words = text.split(' ');
	const truncatedText = words.slice(0, 16).join(' ');
	const id = text.match(/%%id:(.*?)%%/)?.[1] || CryptoJS.MD5(truncatedText).toString();
	return id;
}
