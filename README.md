# GitHub README for Obsidian

Turn your Obsidian vault into a smarter GitHub documentation workspace.

GitHub README is a polished Obsidian plugin that lets you browse your repositories, open a README, edit it in a Markdown editor, preview it live, and push the updates back to GitHub without leaving your knowledge base.

## Why this plugin?

If you work on repositories, documentation, and notes in parallel, this plugin removes the friction between your writing flow and your GitHub docs workflow.

Instead of jumping between GitHub, your editor, and your notes, you can:

- browse your GitHub repos from inside Obsidian
- open any README in a distraction-free workspace
- write and refine documentation with Markdown tools
- preview the rendered result instantly
- save the update back to the repository with a commit message

It is built for developers, technical writers, and creators who want documentation to feel like part of their Obsidian workflow.

## Key features

- **GitHub repo discovery**: Browse public and private repositories from your authenticated GitHub account with search and visibility filters
- **Direct README editing**: Open and edit any repository README in a distraction-free workspace
- **Selection formatting menu**: Floating context toolbar that appears when selecting text with instant Bold, Italic, and Strikethrough actions
- **Smart inline suggestions**: Real-time ghost text word completions prioritizing vocabulary from your README (press `Tab` to accept, `Esc` to dismiss)
- **Editor, preview & split modes**: Switch seamlessly between editor-only, rendered preview, or side-by-side split view
- **Draggable split resizer**: Customize the split ratio between editor and preview by dragging the divider
- **Collapsible repo sidebar**: Smooth animated slide-and-fade toggle to maximize your editing workspace
- **One-click GitHub push**: Commit and push changes directly back to GitHub with custom commit messages
- **Live Obsidian vault sync**: Save and live-sync a local copy into your vault with automatic two-way file tracking
- **Customizable settings**: Toggle line numbers, inline suggestions, selection toolbar, and default view mode

## Smart editing features

### Selection formatting menu (context menu)
When you select text inside the README editor, a floating formatting menu automatically appears near your selection. You can instantly apply or toggle:
- **Bold** (`**text**`)
- *Italic* (`*text*`)
- ~~Strikethrough~~ (`~~text~~`)

If selected text is already formatted, clicking the button cleans up and removes the markers. This can be toggled on or off in the plugin settings.

### Inline ghost text suggestions
Speed up your writing with intelligent word completions that appear as faint ghost text ahead of your cursor. Suggestions prioritize words already used throughout your document, backed by an English dictionary.
- Press **Tab** to accept the suggestion
- Press **Escape** to dismiss it
- Can be enabled or disabled in plugin settings

### Collapsible sidebar & resizable workspace
- Click the sidebar toggle button in the header to smoothly slide and collapse the repository bar for an uninterrupted, full-width writing space.
- In split mode, drag the vertical resizer bar to allocate more room to either the Markdown editor or the rendered preview.

## The workflow

1. Connect your GitHub Personal Access Token in plugin settings.
2. Pick a repository from the sidebar (filter by name, language, or public/private visibility).
3. Open the repository README into the editor.
4. Write and refine with inline suggestions and the selection formatting menu.
5. Review the rendered output in live preview or split view.
6. Push your commit directly back to GitHub with a custom commit message.
7. Optionally open and live-sync a local copy inside your Obsidian vault.

This turns README editing into a smooth part of your note-taking and documentation process rather than a separate task.

## Configuration & settings

Fine-tune the editing experience in Obsidian **Settings → GitHub README**:

- **GitHub Personal Access Token**: Securely store your token locally in `data.json` with classic or fine-grained repo permissions.
- **Default view mode**: Choose how READMEs open by default (`Editor`, `Viewer`, or `Split`).
- **Show line numbers**: Toggle line numbers in the editor gutter.
- **Inline suggestions**: Toggle intelligent word ghost completions.
- **Selection formatting menu**: Toggle the floating formatting context menu on text selection.

## Built for

- software engineers updating project docs
- maintainers polishing repository landing pages
- technical writers working across notes and GitHub
- knowledge workers who live in Obsidian and want GitHub content closer to their workflow

## Screenshots

GitHub README keeps repository browsing and documentation work together in one focused workspace.

### Markdown editor

Write and refine your README with the repository list visible beside the editor.

![Markdown editor in Obsidian](https://community.obsidian.md/api/images/13399)

### Live preview

Review the rendered README before publishing it back to GitHub.

![README live preview in Obsidian](https://community.obsidian.md/api/images/13400)

### Split view

Edit Markdown and compare the rendered result side by side.

![README split view in Obsidian](https://community.obsidian.md/api/images/13401)

## Why it stands out

This is not just a GitHub viewer. It is a documentation workflow tool for Obsidian users who want to write, review, and publish README content without breaking concentration.

It bridges the gap between note-taking and GitHub-backed project documentation in a way that feels natural, fast, and focused.
