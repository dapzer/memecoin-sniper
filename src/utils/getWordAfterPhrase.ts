export const getWordAfterPhrase = (phrase: string ,text: string) => {
  const phraseIndex = text.indexOf(phrase);
  if (phraseIndex === -1) {
    return null;
  }

  const afterPhrase = text.slice(phraseIndex + phrase.length);
  const wordMatch = afterPhrase.match(/\b\w+\b/);
  return wordMatch ? wordMatch[0] : null;
}
