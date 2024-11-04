export function countSentences(content: string) {
	if (!content || content.length === 0) return 0;

	content = content.trim().replace(/%%.*?%%/g, '');
	if (content.split(/\s+/).length === 1) return 1;

	let sentenceCount = (content.match(/[.!?:]+/g) || []).length;
	if (sentenceCount === 0) sentenceCount = 1;
	if (!/[.!?:]$/.test(content)) sentenceCount += 1;

	return sentenceCount;
}

export function countWPM(words: number, time: number) {
	return words > 0 ? words / time : 0;
	// return totalMinutes > 0 ? words / totalMinutes : 0;
}

export const charCountConfig = {
	textCounter: (text: string) => text.replace(/%%.*?%%/g, '').length,
	wordCounter: (text: string) =>
		text
			.replace(/%%.*?%%/g, '')
			.split(' ')
			.filter((word) => word !== '').length
};
