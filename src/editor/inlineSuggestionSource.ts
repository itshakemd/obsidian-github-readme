import type { EditorState } from "@codemirror/state";
import { englishWordCompletion } from "./englishWordCompletion";

function preserveCase(suffix: string, prefix: string): string {
  if (prefix === prefix.toUpperCase()) return suffix.toUpperCase();
  return suffix;
}

function wordCompletion(doc: string, before: string): string | null {
  const match = before.match(/([\p{L}\p{N}_-]{2,})$/u);
  if (!match) return null;

  const prefix = match[1];
  const normalizedPrefix = prefix.toLocaleLowerCase();
  const counts = new Map<string, number>();
  for (const word of doc.match(/[\p{L}\p{N}_-]{3,}/gu) ?? []) {
    const normalizedWord = word.toLocaleLowerCase();
    if (normalizedWord === normalizedPrefix || !normalizedWord.startsWith(normalizedPrefix)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const documentCandidate = [...counts.entries()]
    .sort(([a, aCount], [b, bCount]) => bCount - aCount || a.length - b.length)[0]?.[0];
  const candidate = documentCandidate ?? englishWordCompletion(normalizedPrefix);
  if (!candidate) return null;
  return preserveCase(candidate.slice(prefix.length), prefix);
}

export function createLocalInlineSuggestion(state: EditorState): string | null {
  const selection = state.selection.main;
  if (!selection.empty) return null;

  const cursor = selection.head;
  const line = state.doc.lineAt(cursor);
  if (cursor !== line.to || line.text.trimStart().startsWith("```")) return null;

  const doc = state.doc.toString();
  const before = doc.slice(0, cursor);
  return wordCompletion(doc, before);
}
