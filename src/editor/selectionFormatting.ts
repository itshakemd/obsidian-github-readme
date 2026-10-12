export interface FormatAction {
  label: string;
  title: string;
  marker: string;
}

export const formatActions: FormatAction[] = [
  { label: "B", title: "Bold", marker: "**" },
  { label: "I", title: "Italic", marker: "*" },
  { label: "S", title: "Strikethrough", marker: "~~" },
];
