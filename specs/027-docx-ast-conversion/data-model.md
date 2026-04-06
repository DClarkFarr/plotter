# Data Model: Docx AST Conversion

## Parser Output

```text
ImportParseResult
- elements: Element[]
- tags: Tag[]
- characters: Character[]
- issues: ImportIssue[]
```

### Element (union)

```text
ActElement
- type: "act"
- title: string
- content: string[] (HTML strings with inline formatting)

ChapterElement
- type: "chapter"
- title: string
- actId: string

SceneElement
- type: "scene"
- title: string
- chapterId: string
- povCharacterId: string | null
- tagIds: string[]
- characterIds: string[]
- snippets: Snippet[]
- content: string[] (HTML strings for scene body paragraphs)
```

## Tags and Characters

```text
Tag
- id: string
- name: string
- variant: string | null
- color: string | null

Character
- id: string
- name: string
```

## Snippets

```text
Snippet
- id: string
- order: number
- content: string[] (HTML strings for the snippet paragraphs)
```

## Import Issues

```text
ImportIssue
- level: "error" | "warning"
- message: string
- location: string | null (e.g., heading text or paragraph index)
```

## Relationships

- Acts contain Chapters; Chapters contain Scenes.
- Scenes reference Tags and Characters by id.
- Tags and Characters are deduplicated by normalized name.
- Snippets belong to a Scene and preserve paragraph order.

## Parsing Rules Summary

- H1 headings create Act elements; paragraphs following the H1 are stored as `ActElement.content`.
- H2 headings create Chapter elements (no chapter content body).
- H4 headings create Scene elements; POV is parsed from "POV: Title" heading format.
- Tags are parsed from `[tag]` or `[tag:variant]` markers in the H4 heading with highlight color preserved.
- Snippets are paragraphs with a left margin indent; consecutive indented paragraphs are grouped.
