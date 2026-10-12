import englishWords from "an-array-of-english-words";

export function englishWordCompletion(prefix: string): string | null {
  let low = 0;
  let high = englishWords.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (englishWords[middle] < prefix) low = middle + 1;
    else high = middle;
  }

  if (englishWords[low] === prefix) return null;

  let best: string | null = null;
  for (let index = low; index < englishWords.length && index < low + 128; index += 1) {
    const word = englishWords[index];
    if (!word.startsWith(prefix)) break;
    if (word === prefix || word.includes("'")) continue;
    if (!best || word.length < best.length) best = word;
  }
  return best;
}
